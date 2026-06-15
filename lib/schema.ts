import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const notebooks = sqliteTable('notebooks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#10b981'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default('제목 없음'),
  content: text('content').notNull().default(''),
  notebookId: text('notebook_id'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const notesToTags = sqliteTable('notes_to_tags', {
  noteId: text('note_id').notNull(),
  tagId: text('tag_id').notNull(),
})

export const notebooksRelations = relations(notebooks, ({ many }) => ({
  notes: many(notes),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  notebook: one(notebooks, { fields: [notes.notebookId], references: [notebooks.id] }),
  notesToTags: many(notesToTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  notesToTags: many(notesToTags),
}))

export const notesToTagsRelations = relations(notesToTags, ({ one }) => ({
  note: one(notes, { fields: [notesToTags.noteId], references: [notes.id] }),
  tag: one(tags, { fields: [notesToTags.tagId], references: [tags.id] }),
}))
