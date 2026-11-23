import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  commonName: varchar("common_name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  origin: text("origin").notNull(),
  description: text("description").notNull(),
  funFact: text("fun_fact").notNull(),
  imagePath: varchar("image_path", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
