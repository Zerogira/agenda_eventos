
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'e0d9f697-28a4-4c29-b4f2-d6c713d84972';
  
  try {
    const user = await prisma.usuario.update({
      where: { id: userId },
      data: {
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Usuário atualizado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
