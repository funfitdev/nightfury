import { z } from "zod/v4";
import { orpc, type ApiContext } from "../context";
import {
  postSchema,
  postWithAuthorSchema,
  createPostInput,
  updatePostInput,
  type Post,
  type PostWithAuthor,
} from "../schemas";

// Input types
type ListPostsInput = { query: { limit: number } };
type GetPostInput = { params: { id: string } };
type CreatePostInput = { body: { title: string; content: string } };
type UpdatePostInput = { params: { id: string }; body: { title?: string; content?: string } };
type DeletePostInput = { params: { id: string } };

// Output types
type UpdatePostOutput = Post & { updated: true };
type DeletePostOutput = { deleted: true; id: string };

// Handlers
function listPosts({ input }: { input: ListPostsInput; context: ApiContext }): Post[] {
  return Array.from({ length: input.query.limit }, (_, i) => ({
    id: String(i + 1),
    title: `Post ${i + 1}`,
    content: `Content for post ${i + 1}`,
  }));
}

function getPost({ input }: { input: GetPostInput; context: ApiContext }): PostWithAuthor {
  return {
    id: input.params.id,
    title: `Post ${input.params.id}`,
    content: `Full content for post ${input.params.id}`,
    author: { id: "1", name: "Alice" },
  };
}

function createPost({ input }: { input: CreatePostInput; context: ApiContext }): Post {
  return {
    id: crypto.randomUUID(),
    title: input.body.title,
    content: input.body.content,
  };
}

function updatePost({ input }: { input: UpdatePostInput; context: ApiContext }): UpdatePostOutput {
  return {
    id: input.params.id,
    title: input.body.title ?? `Post ${input.params.id}`,
    content: input.body.content ?? `Content for post ${input.params.id}`,
    updated: true,
  };
}

function deletePost({ input }: { input: DeletePostInput; context: ApiContext }): DeletePostOutput {
  return {
    deleted: true,
    id: input.params.id,
  };
}

// Router
export const postRouter = orpc.router({
  list: orpc
    .route({ method: "GET", path: "/api/posts", inputStructure: "detailed" })
    .input(z.object({ query: z.object({ limit: z.coerce.number().optional().default(10) }) }))
    .output(z.array(postSchema))
    .handler(listPosts),

  get: orpc
    .route({ method: "GET", path: "/api/posts/{id}", inputStructure: "detailed" })
    .input(z.object({ params: z.object({ id: z.string() }) }))
    .output(postWithAuthorSchema)
    .handler(getPost),

  create: orpc
    .route({ method: "POST", path: "/api/posts", inputStructure: "detailed" })
    .input(z.object({ body: createPostInput }))
    .output(postSchema)
    .handler(createPost),

  update: orpc
    .route({ method: "PUT", path: "/api/posts/{id}", inputStructure: "detailed" })
    .input(z.object({
      params: z.object({ id: z.string() }),
      body: updatePostInput,
    }))
    .output(postSchema.extend({ updated: z.literal(true) }))
    .handler(updatePost),

  delete: orpc
    .route({ method: "DELETE", path: "/api/posts/{id}", inputStructure: "detailed" })
    .input(z.object({ params: z.object({ id: z.string() }) }))
    .output(z.object({ deleted: z.literal(true), id: z.string() }))
    .handler(deletePost),
});
