import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ConstitutionalThesis from "@/components/landing/ConstitutionalThesis";
import ArchitectureLattice from "@/components/landing/ArchitectureLattice";
import OfflineNode from "@/components/landing/OfflineNode";
import MathCore from "@/components/landing/MathCore";
import DeploymentPath from "@/components/landing/DeploymentPath";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ConstitutionalThesis />
      <ArchitectureLattice />
      <OfflineNode />
      <MathCore />
      <DeploymentPath />
      <FinalCTA />
    </main>
  );
}
