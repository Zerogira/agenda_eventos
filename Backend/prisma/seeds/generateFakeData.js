const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CLIENTES_FALSOS = [
  { nome: "João Silva", telefone: "11988887777", cidade: "São Paulo" },
  { nome: "Maria Oliveira", telefone: "21977776666", cidade: "Rio de Janeiro" },
  { nome: "Carlos Souza", telefone: "31966665555", cidade: "Belo Horizonte" },
  { nome: "Ana Costa", telefone: "41955554444", cidade: "Curitiba" },
  { nome: "Roberto Almeida", telefone: "51944443333", cidade: "Porto Alegre" },
  { nome: "Fernanda Lima", telefone: "61933332222", cidade: "Brasília" },
  { nome: "Ricardo Santos", telefone: "71922221111", cidade: "Salvador" },
  { nome: "Patrícia Gomes", telefone: "81911110000", cidade: "Recife" },
  { nome: "Marcelo Rocha", telefone: "85900009999", cidade: "Fortaleza" },
  { nome: "Juliana Martins", telefone: "92999998888", cidade: "Manaus" },
];

const BRINQUEDOS_FALSOS = [
  { nome: "Cama Elástica Grande", descricao: "4.27m com rede de proteção", marca: "Nacional", quantidade_total: 3, valorUnitario: 150.00, necessita_funcionario: true },
  { nome: "Piscina de Bolinhas", descricao: "2x2m inflável", marca: "Premium", quantidade_total: 5, valorUnitario: 120.00, necessita_funcionario: false },
  { nome: "Castelo Inflável", descricao: "3x3m com escorregador", marca: "Playground", quantidade_total: 2, valorUnitario: 250.00, necessita_funcionario: true },
  { nome: "Tobogã Médio", descricao: "5m de altura", marca: "Extreme", quantidade_total: 1, valorUnitario: 350.00, necessita_funcionario: true },
  { nome: "Giroscópio Humano", descricao: "Para eventos radicais", marca: "Radical", quantidade_total: 1, valorUnitario: 500.00, necessita_funcionario: true },
  { nome: "Máquina de Algodão Doce", descricao: "Profissional", marca: "Sugar", quantidade_total: 4, valorUnitario: 80.00, necessita_funcionario: true },
  { nome: "Pipoqueira Elétrica", descricao: "Carrinho retrô", marca: "Popcorn", quantidade_total: 3, valorUnitario: 100.00, necessita_funcionario: true },
  { nome: "Touro Mecânico", descricao: "Controle digital", marca: "Rodeo", quantidade_total: 1, valorUnitario: 600.00, necessita_funcionario: true },
];

const FUNCIONARIOS_FALSOS = [
  { nome: "André Ferreira", cpf: "123.456.789-01", telefone: "11911112222" },
  { nome: "Beatriz Santos", cpf: "234.567.890-12", telefone: "11922223333" },
  { nome: "Caio Mendes", cpf: "345.678.901-23", telefone: "11933334444" },
  { nome: "Daniela Lima", cpf: "456.789.012-34", telefone: "11944445555" },
  { nome: "Eduardo Rocha", cpf: "567.890.123-45", telefone: "11955556666" },
  { nome: "Flávia Costa", cpf: "678.901.234-56", telefone: "11966667777" },
  { nome: "Gabriel Souza", cpf: "789.012.345-67", telefone: "11977778888" },
  { nome: "Helena Oliveira", cpf: "890.123.456-78", telefone: "11988889999" },
];

const TITULOS_EVENTO = [
  "Aniversário de 5 anos do Léo",
  "Festa da Firma - Confraternização",
  "Chá de Bebê da Alice",
  "Casamento de Juliana e Pedro",
  "Inauguração da Loja Nova",
  "Festa Julina do Condomínio",
  "Batizado do Heitor",
  "Evento Corporativo Tech",
  "Aniversário de 15 anos - Debutante",
  "Festa de Encerramento Escolar",
];

const BAIRROS = ["Centro", "Jardim América", "Vila Nova", "Bela Vista", "Santa Efigênia", "Ipanema", "Leblon", "Pinheiros", "Moema", "Tatuapé"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateFakeData(empresaId, volume) {
  console.log(`[GenerateFakeData] Gerando ${volume} registros para empresa: ${empresaId}`);

  // 1. Criar Clientes (baseado no volume)
  console.log("-> Criando clientes...");
  const clientesData = Array.from({ length: Math.ceil(volume / 5) }).map((_, i) => {
    const base = getRandom(CLIENTES_FALSOS);
    return {
      empresaId,
      nome: `${base.nome} ${i + 1}`,
      telefone: base.telefone,
      cidade: base.cidade,
    };
  });
  await prisma.cliente.createMany({ data: clientesData });
  const clientes = await prisma.cliente.findMany({ where: { empresaId } });

  // 2. Criar Brinquedos (fixos + variação)
  console.log("-> Criando brinquedos...");
  const brinquedosData = BRINQUEDOS_FALSOS.map(b => ({ ...b, empresaId }));
  await prisma.brinquedo.createMany({ data: brinquedosData, skipDuplicates: true });
  const brinquedos = await prisma.brinquedo.findMany({ where: { empresaId } });

  // 3. Criar Funcionários
  console.log("-> Criando funcionários...");
  const funcionariosData = FUNCIONARIOS_FALSOS.map(f => ({ ...f, empresaId }));
  await prisma.funcionario.createMany({ data: funcionariosData, skipDuplicates: true });
  const funcionarios = await prisma.funcionario.findMany({ where: { empresaId } });

  // 4. Criar Eventos (Volume Principal)
  console.log(`-> Criando ${volume} eventos...`);
  const statusList = ["AGENDADO", "CONFIRMADO", "FINALIZADO", "CANCELADO", "CONCLUIDO"];
  
  for (let i = 0; i < volume; i++) {
    const cliente = getRandom(clientes);
    const dataInicio = getRandomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
    const dataFim = new Date(dataInicio.getTime() + (4 * 60 * 60 * 1000)); // +4 horas

    const evento = await prisma.evento.create({
      data: {
        empresaId,
        clienteId: cliente.id,
        titulo: `${getRandom(TITULOS_EVENTO)} #${i + 1}`,
        descricao: "Evento gerado automaticamente para testes.",
        dataInicio,
        dataFim,
        status: getRandom(statusList),
        valorTotal: (Math.random() * 2000 + 500).toFixed(2),
        endereco: "Rua das Flores, " + Math.floor(Math.random() * 1000),
        bairro: getRandom(BAIRROS),
        cidade: cliente.cidade,
        estado: "SP",
      }
    });

    // Adicionar 1-3 brinquedos aleatórios ao evento
    const numBrinquedos = Math.floor(Math.random() * 3) + 1;
    const selecionadosB = [];
    for (let j = 0; j < numBrinquedos; j++) {
      const b = getRandom(brinquedos);
      if (!selecionadosB.find(x => x.brinquedoId === b.id)) {
        selecionadosB.push({
          brinquedoId: b.id,
          quantidade: 1
        });
      }
    }
    
    if (selecionadosB.length > 0) {
      await prisma.eventoBrinquedo.createMany({
        data: selecionadosB.map(b => ({ ...b, eventoId: evento.id }))
      });
    }

    // Adicionar 1-2 funcionários aleatórios ao evento
    const numFunc = Math.floor(Math.random() * 2) + 1;
    const selecionadosF = [];
    for (let j = 0; j < numFunc; j++) {
      const f = getRandom(funcionarios);
      if (!selecionadosF.includes(f.id)) {
        selecionadosF.push(f.id);
      }
    }

    if (selecionadosF.length > 0) {
      await prisma.eventoFuncionario.createMany({
        data: selecionadosF.map(fId => ({ funcionarioId: fId, eventoId: evento.id }))
      });
    }

    if ((i + 1) % 100 === 0) {
      console.log(`   - Progresso: ${i + 1}/${volume} eventos criados`);
    }
  }

  console.log(`[GenerateFakeData] Sucesso! ${volume} eventos e dependências criados.`);
}

async function cleanFakeData(empresaId) {
  console.log(`[CleanFakeData] Removendo dados da empresa: ${empresaId}`);
  // O onDelete: Cascade no schema ajuda, mas vamos garantir
  await prisma.evento.deleteMany({ where: { empresaId } });
  await prisma.cliente.deleteMany({ where: { empresaId } });
  await prisma.brinquedo.deleteMany({ where: { empresaId } });
  await prisma.funcionario.deleteMany({ where: { empresaId } });
  console.log("[CleanFakeData] Limpeza concluída.");
}

module.exports = { generateFakeData, cleanFakeData };
