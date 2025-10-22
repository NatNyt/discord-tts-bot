import { int, sqliteTable, text, } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  discordId: text().unique().notNull(),
  nickname: text(),
  language: text().default("th-TH"),
  readUserName: int().default(0),
  model: text(),
});
