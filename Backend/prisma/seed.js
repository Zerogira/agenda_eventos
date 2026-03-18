const { seedRunner } = require("./seeds/seedRunner");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await seedRunner();
}

main()
  .catch((e) => {
    console.error("Falha no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
