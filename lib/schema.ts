import { text, boolean, pgTable } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const notebooks = pgTable('notebooks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#10b981'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default('제목 없음'),
  content: text('content').notNull().default(''),
  notebookId: text('notebook_id'),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const notesToTags = pgTable('notes_to_tags', {
  noteId: text('note_id').notNull(),
  tagId: text('tag_id').notNull(),
})

export const notebooksRelations = relations(notebooks, ({ many }) => ({
  notes: many(notes),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  notebook: one(notebooks, {
    fields: [notes.notebookId],
    references: [notebooks.id],
  }),
  notesToTags: many(notesToTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  notesToTags: many(notesToTags),
}))

export const notesToTagsRelations = relations(notesToTags, ({ one }) => ({
  note: one(notes, {
    fields: [notesToTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [notesToTags.tagId],
    references: [tags.id],
  }),
}))