import {
  pgTable,
  bigint,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// usuarios
export const users = pgTable("users", {
  // Usamos mode: "number" para o Next.js tratar o bigint do Postgres como número normal
  id: bigint("id", { mode: "number" }).primaryKey(),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 1000 }),
});

// animes
export const animes = pgTable("animes", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" }).references(() => users.id),
  malId: bigint("mal_id", { mode: "number" }),
  title: varchar("title", { length: 200 }),
  type: varchar("type", { length: 255 }),
  status: varchar("status", { length: 255 }), // Adicionei status pois o seu frontend depende dele
  score: varchar("score", { length: 255 }),
  episodes: integer("episodes"),
  watchedEpisodes: integer("watched_episodes"),
  imageUrl: varchar("image_url", { length: 500 }),
  comments: text("comments"), // Onde ficam os textos das resenhas
  isFavorite: boolean("is_favorite").default(false),
  reviewLikes: integer("review_likes").default(0),
});

export const usersRelations = relations(users, ({ many }) => ({
  animes: many(animes),
}));

export const animesRelations = relations(animes, ({ one }) => ({
  user: one(users, {
    fields: [animes.userId],
    references: [users.id],
  }),
}));
