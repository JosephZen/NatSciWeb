import { db } from "@/db";
import { species, Species } from "@/db/schema";
import fallbackData from "@/data/fallback-species.json";

export type SpeciesItem = {
  id: number;
  slug: string;
  commonName: string;
  scientificName: string;
  category: string;
  origin: string;
  description: string;
  funFact: string;
  imagePath: string;
};

export async function getSpeciesList(): Promise<{ data: SpeciesItem[]; source: "neon" | "local" }> {
  // If Neon DB is connected
  if (db) {
    try {
      const records = await db.select().from(species);
      if (records && records.length > 0) {
        const sorted = records.sort((a, b) => a.id - b.id).map((r) => ({
          id: r.id,
          slug: r.slug,
          commonName: r.commonName,
          scientificName: r.scientificName,
          category: r.category,
          origin: r.origin,
          description: r.description,
          funFact: r.funFact,
          imagePath: r.imagePath,
        }));
        return { data: sorted, source: "neon" };
      }
    } catch (error) {
      console.warn("⚠️ Neon DB query failed or table not seeded yet. Falling back to local data.", error);
    }
  }

  // Graceful fallback to verified local JSON
  return {
    data: fallbackData as SpeciesItem[],
    source: "local",
  };
}
