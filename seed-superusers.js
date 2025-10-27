const { PrismaClient, UserType } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const superusers = [
    { email: 'me@vinaychaddha.in', name: 'Vinay Chaddha' },
    { email: 'vinay.gvc@gmail.com', name: 'Vinay GVC' },
    { email: 'sd@gvc.in', name: 'SD GVC' },
  ];

  for (const user of superusers) {
    // Create authorized user
    const authorizedUser = await prisma.authorizedUser.upsert({
      where: { email: user.email },
      update: { type: UserType.SUPERADMIN },
      create: {
        email: user.email,
        type: UserType.SUPERADMIN,
      },
    });

    // Create patient test user
    await prisma.patientTestUser.upsert({
      where: { email: user.email },
      update: { name: user.name, userType: UserType.SUPERADMIN },
      create: {
        name: user.name,
        email: user.email,
        password: '',
        userType: UserType.SUPERADMIN,
      },
    });

    console.log(`Created superuser: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
