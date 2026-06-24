import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('1. Creating test record...');
  const shelter = await prisma.shelter.create({
    data: {
      name: 'Verify Script Test Shelter',
      email: 'verify-test@example.com',
    },
  });
  console.log('   Created:', shelter);

  console.log('2. Reading back the created record...');
  const found = await prisma.shelter.findUnique({
    where: { id: shelter.id },
  });
  console.log('   Found:', found);

  console.log('3. Cleaning up test record...');
  await prisma.shelter.delete({ where: { id: shelter.id } });
  console.log('   Cleaned up');

  console.log('✅ Verification passed: Prisma Client read/write path is working');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });