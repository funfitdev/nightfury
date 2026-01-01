import { Outlet } from "@/components/outlet";

export default function UsersLayout() {
  return (
    <div className="users-layout">
      <nav className="users-nav">
        <h2>Users Section</h2>
        <ul>
          <li>
            <a href="/users">All Users</a>
          </li>
          <li>
            <a href="/users/create">Create User</a>
          </li>
          <li>
            <a href="/users/settings">Settings</a>
          </li>
        </ul>
      </nav>
      <main className="users-content">
        <Outlet />
      </main>
    </div>
  );
}
