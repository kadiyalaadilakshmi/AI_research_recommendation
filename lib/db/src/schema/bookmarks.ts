import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  paperId: text("paper_id").notNull().unique(),
  title: text("title").notNull(),
  authors: jsonb("authors").notNull().$type<string[]>(),
  year: integer("year"),
  url: text("url"),
  source: text("source").notNull(),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, savedAt: true });
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type BookmarkRow = typeof bookmarksTable.$inferSelect;
