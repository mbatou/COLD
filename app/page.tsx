import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TensionTicker from "@/components/TensionTicker";

// Below-the-fold sections are lazy-loaded for faster initial paint.
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const EvidencePreview = dynamic(() => import("@/components/EvidencePreview"));
const LiveStats = dynamic(() => import("@/components/LiveStats"));
const CasePreviews = dynamic(() => import("@/components/CasePreviews"));
const FinalCTA = dynamic(() => import("@/components/FinalCTA"));

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TensionTicker />
      <HowItWorks />
      <EvidencePreview />
      <LiveStats />
      <CasePreviews />
      <FinalCTA />
    </main>
  );
}
