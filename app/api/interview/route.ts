import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSuspect, MAX_QUESTIONS_PER_SUSPECT } from "@/data/cases/0044/suspects";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface InterviewBody {
  suspectId: string;
  roomId: string;
  message: string;
  conversationHistory?: { role: "user" | "suspect"; content: string }[];
}

export async function POST(req: NextRequest) {
  let body: InterviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { suspectId, roomId, message } = body;
  if (!suspectId || !roomId || !message?.trim()) {
    return NextResponse.json(
      { error: "Missing suspectId, roomId, or message" },
      { status: 400 }
    );
  }

  const suspect = getSuspect(suspectId);
  if (!suspect) {
    return NextResponse.json({ error: "Unknown suspect" }, { status: 404 });
  }

  // Accept either ANTHROPIC_API_KEY or ANTHROPIC_SECRET_KEY (Vercel naming).
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Interview service is not configured." },
      { status: 503 }
    );
  }

  // --- Auth + membership: only room members may interrogate. ---
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this room." },
      { status: 403 }
    );
  }

  // --- Rate limit: max questions per suspect per room. ---
  const { count } = await supabase
    .from("interview_messages")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("suspect_id", suspectId)
    .eq("role", "user");

  if ((count ?? 0) >= MAX_QUESTIONS_PER_SUSPECT) {
    return NextResponse.json(
      {
        error: `Question limit reached for ${suspect.name}.`,
        questionsAsked: count,
        limitReached: true,
      },
      { status: 429 }
    );
  }

  // --- Build conversation history from the DB (last 20 turns). ---
  const { data: history } = await supabase
    .from("interview_messages")
    .select("role, content")
    .eq("room_id", roomId)
    .eq("suspect_id", suspectId)
    .order("created_at", { ascending: true })
    .limit(20);

  const priorTurns = (history ?? []).map((m) => ({
    role: m.role === "suspect" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const anthropic = new Anthropic({ apiKey });

  let reply: string;
  try {
    const completion = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: suspect.systemPrompt,
      messages: [
        ...priorTurns,
        { role: "user", content: message.trim() },
      ],
    });
    const block = completion.content.find((b) => b.type === "text");
    reply =
      block && block.type === "text"
        ? block.text.trim()
        : "...";
  } catch (err) {
    console.error("Anthropic error:", err);
    return NextResponse.json(
      { error: "The suspect went quiet. Try again." },
      { status: 502 }
    );
  }

  // --- Persist both turns so all players see the transcript via Realtime. ---
  await supabase.from("interview_messages").insert([
    {
      room_id: roomId,
      suspect_id: suspectId,
      role: "user",
      content: message.trim(),
      asked_by: user.id,
    },
    {
      room_id: roomId,
      suspect_id: suspectId,
      role: "suspect",
      content: reply,
      asked_by: null,
    },
  ]);

  return NextResponse.json({
    reply,
    questionsAsked: (count ?? 0) + 1,
    questionsRemaining: MAX_QUESTIONS_PER_SUSPECT - ((count ?? 0) + 1),
  });
}
