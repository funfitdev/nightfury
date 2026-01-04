import { prisma } from "@/lib/db";
import { parseFormData } from "@/lib/form";
import { roleSchema, type RoleFormState } from "../-components/role-form";
import { RolesPage } from "../-components/roles-page";

async function getRoles() {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userRoles: true,
          orgRoles: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function RouteComponent() {
  const roles = await getRoles();
  return <RolesPage roles={roles} />;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = parseFormData(roleSchema, formData);

  if (!result.success) {
    const roles = await getRoles();
    const formState: RoleFormState = {
      values: {
        name: formData.get("name")?.toString() ?? "",
        displayName: formData.get("displayName")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
      },
      fieldErrors: result.fieldErrors,
    };
    return <RolesPage roles={roles} formState={formState} />;
  }

  // Check if role name already exists
  const existingRole = await prisma.role.findUnique({
    where: { name: result.data.name },
  });

  if (existingRole) {
    const roles = await getRoles();
    const formState: RoleFormState = {
      values: result.data,
      fieldErrors: {
        name: ["A role with this name already exists"],
      },
    };
    return <RolesPage roles={roles} formState={formState} />;
  }

  await prisma.role.create({
    data: {
      name: result.data.name,
      displayName: result.data.displayName,
      description: result.data.description || null,
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/roles" },
  });
}
