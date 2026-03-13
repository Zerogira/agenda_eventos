const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function getEnv(name, fallback) {
  const val = process.env[name];
  if (val === undefined || val === null || val === "") return fallback;
  return val;
}

async function main() {
  const empresaNome = getEnv("SEED_EMPRESA_NOME", "Empresa ADM Padrão");
  const adminEmail = getEnv("SEED_ADMIN_EMAIL", "admin@local.com");
  const adminPassword = getEnv("SEED_ADMIN_PASSWORD", "Admin123");
  const inviteCode = getEnv("SEED_INVITE_CODE", "MASTER-1234");
  const inviteExpiresAt = new Date(getEnv("SEED_INVITE_EXPIRES_AT", "2099-01-01T00:00:00.000Z"));

  const empresa =
    (await prisma.empresa.findFirst({ where: { nome: empresaNome } })) ||
    (await prisma.empresa.create({ data: { nome: empresaNome } }));

  const senhaHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      nome: "Admin",
      senha: senhaHash,
      role: "SUPER_ADMIN",
      empresaId: empresa.id,
    },
    create: {
      nome: "Admin",
      email: adminEmail,
      senha: senhaHash,
      role: "SUPER_ADMIN",
      empresaId: empresa.id,
    },
  });

  const convite = await prisma.conviteEmpresa.upsert({
    where: { codigo: inviteCode },
    update: {
      empresaId: empresa.id,
      usado: false,
      expiresAt: inviteExpiresAt,
    },
    create: {
      codigo: inviteCode,
      empresaId: empresa.id,
      usado: false,
      expiresAt: inviteExpiresAt,
    },
  });

  console.log("Seed concluído com sucesso:");
  console.log({
    empresaId: empresa.id,
    empresaNome: empresa.nome,
    adminEmail: adminUser.email,
    adminRole: adminUser.role,
    inviteCode: convite.codigo,
    inviteExpiresAt: convite.expiresAt.toISOString(),
  });
}

main()
  .catch((e) => {
    console.error("Falha no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

