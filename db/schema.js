// import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// export const todosTable = pgTable("todos", {
//     id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     todo: text().notNull(),
//     createdAt: timestamp('created_at').defaultNow(),
//     updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
// });

// export const usersTable = pgTable("users", {
//     id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     email: text().notNull(),
//     password: text().notNull(),
//     createdAt: timestamp('created_at').defaultNow(),
//     updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
// });


import { int, sqliteTable, text, } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const todosTable = sqliteTable("todos", {
    id: int().primaryKey({ autoIncrement: true }),
    todo: text().notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const usersTable = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    email: text().notNull(),
    password: text().notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
