import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import * as schema from "../src/db/schema";

// Load .env.local first, then .env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function main() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("ℹ️  No DATABASE_URL found in .env.local.");
    console.log("ℹ️  To seed your Neon database, create a .env.local file with:");
    console.log("   DATABASE_URL=\"postgresql://<user>:<password>@<ep>.neon.tech/neondb?sslmode=require\"");
    console.log("ℹ️  The site is currently running on the local fallback JSON data seamlessly.");
    return;
  }

  console.log("Connecting to Neon Postgres...");
  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });

  // Read synced species data
  const dataPath = path.join(process.cwd(), "src", "data", "fallback-species.json");
  if (!fs.existsSync(dataPath)) {
    console.error("Missing fallback-species.json. Run 'npm run sync-data' first.");
    process.exit(1);
  }

  const items: Array<schema.NewSpecies> = JSON.parse(fs.readFileSync(dataPath, "utf-8")).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    commonName: item.commonName,
    scientificName: item.scientificName,
    category: item.category,
    origin: item.origin,
    description: item.description,
    funFact: item.funFact,
    imagePath: item.imagePath,
  }));

  console.log(`Seeding ${items.length} species into Neon Postgres...`);

  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS species (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(150) UNIQUE NOT NULL,
      common_name VARCHAR(255) NOT NULL,
      scientific_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      origin TEXT NOT NULL,
      description TEXT NOT NULL,
      fun_fact TEXT NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Upsert all items
  for (const item of items) {
    await sql`
      INSERT INTO species (id, slug, common_name, scientific_name, category, origin, description, fun_fact, image_path)
      VALUES (${item.id}, ${item.slug}, ${item.commonName}, ${item.scientificName}, ${item.category}, ${item.origin}, ${item.description}, ${item.funFact}, ${item.imagePath})
      ON CONFLICT (slug) DO UPDATE SET
        common_name = EXCLUDED.common_name,
        scientific_name = EXCLUDED.scientific_name,
        category = EXCLUDED.category,
        origin = EXCLUDED.origin,
        description = EXCLUDED.description,
        fun_fact = EXCLUDED.fun_fact,
        image_path = EXCLUDED.image_path;
    `;
  }

  console.log("🎉 Successfully seeded 60 species into Neon Postgres!");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
