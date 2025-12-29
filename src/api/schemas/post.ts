import { z } from "zod/v4";

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export const postWithAuthorSchema = postSchema.extend({
  author: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const createPostInput = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const updatePostInput = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export type Post = z.infer<typeof postSchema>;
export type PostWithAuthor = z.infer<typeof postWithAuthorSchema>;
export type CreatePostInput = z.infer<typeof createPostInput>;
export type UpdatePostInput = z.infer<typeof updatePostInput>;
