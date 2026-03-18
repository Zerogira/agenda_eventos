const { PrismaClient } = require("@prisma/client");
const { seedEmpresa } = require("./empresaSeed");
const { generateFakeData, cleanFakeData } = require("./generateFakeData");

const prisma = new PrismaClient();

function getEnv(name, fallback) {
  const val = process.env[name];
  if (val === undefined || val === null || val === "") return fallback;
  return val;
}

async function seedRunner() {
  const isProduction = process.env.NODE_ENV === "production";
  const enableFakeData = getEnv("ENABLE_FAKE_DATA", "false") === "true";
  const fakeDataVolume = parseInt(getEnv("FAKE_DATA_VOLUME", "100"), 10);

  console.log("-----------------------------------------");
  console.log("[SeedRunner] Iniciando...");
  console.log(`- Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`- ENABLE_FAKE_DATA: ${enableFakeData}`);
  console.log(`- FAKE_DATA_VOLUME: ${fakeDataVolume}`);

  // 1. Sempre garantir a empresa e admin base
  const { empresa } = await seedEmpresa();

  // 2. Lógica de Dados Fake
  if (enableFakeData) {
    if (isProduction) {
      console.error("[SeedRunner] SEGURANÇA: Tentativa de rodar seed fake em PRODUÇÃO bloqueada!");
      return;
    }

    console.log("[SeedRunner] Dados fake habilitados. Iniciando geração...");
    
    // Opcional: Limpar dados anteriores para evitar duplicidade exagerada em cada rodada
    // await cleanFakeData(empresa.id); 

    await generateFakeData(empresa.id, fakeDataVolume);
  } else {
    console.log("[SeedRunner] Dados fake desabilitados.");
  }

  console.log("[SeedRunner] Finalizado com sucesso!");
  console.log("-----------------------------------------");
}

module.exports = { seedRunner };
