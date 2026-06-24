import { resetAndSeedDatabase, DEMO_PASSWORD } from '../src/lib/seed-data';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding database...');
  const summary = await resetAndSeedDatabase();

  console.log('Seed completed:');
  console.log(`  Users: ${summary.userCount}`);
  console.log(`  Shelters: ${summary.shelterCount}`);
  console.log(`  Pets: ${summary.petCount}`);
  console.log(`  Applications: ${summary.applicationCount}`);
  console.log('Demo accounts:');
  console.log(`  Adopter -> ${summary.demoAdopterEmail} / ${DEMO_PASSWORD}`);
  console.log(`  Admin   -> ${summary.demoAdminEmail} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
