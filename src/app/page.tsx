import { AmbientCanvas } from "@/components/AmbientCanvas";
import { PortfolioShell } from "@/components/PortfolioShell";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0E0E10] text-[#F4F4F6]">
      <AmbientCanvas />
      <PortfolioShell />
    </div>
  );
}
