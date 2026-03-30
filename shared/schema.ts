import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Local repository types (in-memory, not persisted to DB)
export const connectRepoSchema = z.object({
  path: z.string().min(1, "Path is required"),
});

export type ConnectedRepo = {
  id: string;
  path: string;
  name: string;
  branch: string;
  lastCommit: string;
  connectedAt: string;
};

export type DirectoryEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
  isGitRepo: boolean;
};
