import { prisma } from "@/lib/db";
import { getParams } from "@/lib/context";

export async function POST() {
  const { id } = getParams();

  if (!id) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!permission) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  await prisma.permission.delete({
    where: { id },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/permissions" },
  });
}
