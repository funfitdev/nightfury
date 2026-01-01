import { getParams } from "@/lib/context";

export default function EditUserPage() {
  const { id } = getParams();

  return (
    <div>
      <h1>QQEdit User</h1>
      <p>
        Form to edit user with ID: <code>{id}</code>
      </p>
      <p>
        Route: <code>/users/:id/edit</code>
      </p>
    </div>
  );
}
