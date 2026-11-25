import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { AmbientCanvas } from "@/components/AmbientCanvas";
import { PortfolioShell } from "@/components/PortfolioShell";

export default async function HomePage() {
  const mediaGroups = await Promise.all(
    ["media", "featured"].map(async (directory) => {
      const files = await readdir(join(process.cwd(), "public", directory), { withFileTypes: true }).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") return [];
          throw error;
        },
      );
      return files.filter((file) => file.isFile()).map((file) => `/${directory}/${file.name}`);
    }),
  );
  const availableMedia = mediaGroups.flat();

  return (
    <div className="relative min-h-screen bg-[#0E0E10] text-[#F4F4F6]">
      <AmbientCanvas />
      <PortfolioShell availableMedia={availableMedia} />
    </div>
  );
}
