import { prisma } from "@/lib/db";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123"; // Change this in production!

async function main() {
  console.log("🌱 Seeding database...");

  // Hash the password using Bun's built-in password hashing (argon2id by default)
  const hashedPassword = await Bun.password.hash(ADMIN_PASSWORD, {
    algorithm: "argon2id",
    memoryCost: 65536, // 64 MB
    timeCost: 2,
  });

  // Create admin user with credentials
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      isSuperAdmin: true,
      credentials: {
        upsert: {
          create: { hashedPassword },
          update: { hashedPassword },
        },
      },
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Admin",
      isSuperAdmin: true,
      emailVerified: new Date(),
      credentials: {
        create: { hashedPassword },
      },
    },
    include: { credentials: true },
  });

  console.log(`✅ Admin user created/updated: ${adminUser.email}`);

  // Create default organization with admin as owner
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: {
      name: "Acme Inc",
      ownerId: adminUser.id,
    },
    create: {
      name: "Acme Inc",
      slug: "acme",
      description: "Default organization for the platform",
      ownerId: adminUser.id,
    },
  });

  console.log(`✅ Default organization created/updated: ${defaultOrg.name}`);

  // Add admin as a member of the default organization
  await prisma.organizationMember.upsert({
    where: {
      orgId_userId: {
        orgId: defaultOrg.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      orgId: defaultOrg.id,
      userId: adminUser.id,
    },
  });

  console.log(`✅ Admin user added as member of ${defaultOrg.name}`);

  // Create default roles
  const roles = [
    {
      name: "admin",
      displayName: "Administrator",
      description: "Full system access",
      isSystem: true,
    },
    {
      name: "user",
      displayName: "User",
      description: "Standard user access",
      isSystem: true,
    },
    {
      name: "viewer",
      displayName: "Viewer",
      description: "Read-only access",
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
    console.log(`✅ Role created/updated: ${role.name}`);
  }

  // Assign admin role to admin user
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log(`✅ Admin role assigned to ${adminUser.email}`);
  }

  // Create default permissions
  const resources = ["users", "roles", "organizations", "settings"];
  const actions = ["create", "read", "update", "delete", "manage"];

  for (const resource of resources) {
    for (const action of actions) {
      const name = `${resource}:${action}`;
      await prisma.permission.upsert({
        where: { name },
        update: {
          displayName: `${
            action.charAt(0).toUpperCase() + action.slice(1)
          } ${resource}`,
          resource,
          action,
        },
        create: {
          name,
          displayName: `${
            action.charAt(0).toUpperCase() + action.slice(1)
          } ${resource}`,
          description: `Allows ${action} operations on ${resource}`,
          resource,
          action,
        },
      });
    }
  }
  console.log(`✅ Permissions created/updated`);

  // Assign all permissions to admin role
  if (adminRole) {
    const allPermissions = await prisma.permission.findMany();
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`✅ All permissions assigned to admin role`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`\n📧 Admin login: ${ADMIN_EMAIL}`);
  console.log(`🔑 Admin password: ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  Change the admin password in production!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
