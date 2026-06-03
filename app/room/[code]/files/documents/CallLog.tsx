"use client";

const calls = [
  { time: "22:14h", number: "+221 77 ███ 4421", dur: "00:42", dir: "OUT" },
  { time: "23:02h", number: "+221 33 ███ 1180", dur: "01:15", dir: "IN" },
  { time: "23:51h", number: "+221 77 ███ 9007", dur: "00:08", dir: "OUT" },
  { time: "00:31h", number: "ROOM 304 — INTERNAL", dur: "00:21", dir: "IN" },
  { time: "01:45h", number: "+221 76 ███ 2231", dur: "04:03", dir: "OUT", flag: true },
  { time: "02:09h", number: "+221 33 ███ 0000", dur: "00:55", dir: "OUT" },
];

export default function CallLog() {
  return (
    <div className="mx-auto max-w-2xl border border-[#1f3a1f] bg-[#0b1410] p-6 font-courier text-[#7dd87d] shadow-2xl">
      <div className="mb-4 border-b border-[#1f3a1f] pb-2">
        <p className="text-sm tracking-widest text-[#9fe89f]">
          PBX CALL DETAIL RECORD — V. HARMON / STAFF LINE
        </p>
        <p className="text-[11px] text-[#4d8a4d]">EXPORT 14-OCT · TZ +0000</p>
      </div>

      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="text-[#4d8a4d]">
            <th className="py-1 pr-3 font-normal">TIMESTAMP</th>
            <th className="py-1 pr-3 font-normal">NUMBER</th>
            <th className="py-1 pr-3 font-normal">DUR</th>
            <th className="py-1 font-normal">DIR</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c, i) => (
            <tr
              key={i}
              className={
                c.flag
                  ? "bg-cold-red/20 text-cold-red"
                  : "border-t border-[#132613]"
              }
            >
              <td className="py-1.5 pr-3">{c.time}</td>
              <td className="py-1.5 pr-3">{c.number}</td>
              <td className="py-1.5 pr-3">{c.dur}</td>
              <td className="py-1.5">{c.dir}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 border-t border-[#1f3a1f] pt-2 text-[10px] text-[#4d8a4d]">
        Source: Hotel PBX System Export · Row 01:45h flagged by analyst
      </p>
    </div>
  );
}
