import { prisma } from "@/lib/db";
import { getParams } from "@/lib/context";

export async function POST() {
  const { id } = getParams();

  if (!id) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  // Don't allow deleting system roles
  if (role.isSystem) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  await prisma.role.delete({
    where: { id },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/roles" },
  });
}
