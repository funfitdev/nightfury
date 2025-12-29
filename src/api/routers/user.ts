import { z } from "zod/v4";
import { orpc, type ApiContext } from "../context";
import { userSchema, createUserInput, type User } from "../schemas";

// Input types
type GetUserInput = { params: { id: string } };
type CreateUserInput = { body: { name: string; email: string } };
type DeleteUserInput = { params: { id: string } };

// Output types
type DeleteUserOutput = { deleted: true; id: string };

// Handlers
function getUser({ input }: { input: GetUserInput; context: ApiContext }): User {
  return {
    id: input.params.id,
    name: `User ${input.params.id}`,
    email: `user${input.params.id}@example.com`,
  };
}

function listUsers(): User[] {
  return [
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
    { id: "3", name: "Charlie", email: "charlie@example.com" },
  ];
}

function createUser({ input }: { input: CreateUserInput; context: ApiContext }): User {
  return {
    id: crypto.randomUUID(),
    name: input.body.name,
    email: input.body.email,
  };
}

function deleteUser({ input }: { input: DeleteUserInput; context: ApiContext }): DeleteUserOutput {
  return {
    deleted: true,
    id: input.params.id,
  };
}

// Router
export const userRouter = orpc.router({
  get: orpc
    .route({ method: "GET", path: "/api/users/{id}", inputStructure: "detailed" })
    .input(z.object({ params: z.object({ id: z.string() }) }))
    .output(userSchema)
    .handler(getUser),

  list: orpc
    .route({ method: "GET", path: "/api/users" })
    .output(z.array(userSchema))
    .handler(listUsers),

  create: orpc
    .route({ method: "POST", path: "/api/users", inputStructure: "detailed" })
    .input(z.object({ body: createUserInput }))
    .output(userSchema)
    .handler(createUser),

  delete: orpc
    .route({ method: "DELETE", path: "/api/users/{id}", inputStructure: "detailed" })
    .input(z.object({ params: z.object({ id: z.string() }) }))
    .output(z.object({ deleted: z.literal(true), id: z.string() }))
    .handler(deleteUser),
});
