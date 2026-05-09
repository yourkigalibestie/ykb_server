const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const res = await prisma.publicService.findMany();
    console.log('OK', res.length);
  } catch (e) {
    console.error('PRISMA_ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
