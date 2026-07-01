import bcrypt from 'bcryptjs';
import { PetGender, PetStatus, ApplicationStatus, Role } from '@prisma/client';
import { prisma } from './prisma';
import { SPECIES_CAT, SPECIES_DOG } from './constants/pets';

export const DEMO_PASSWORD = 'Demo1234!';
export const DEMO_ADOPTER_EMAIL = 'demo-adopter@petadoption.dev';
export const DEMO_ADMIN_EMAIL = 'demo-admin@petadoption.dev';

async function resetDatabase() {
  // Delete in dependency order rather than relying on cascade behavior,
  // so the reset logic stays explicit and easy to reason about.
  await prisma.adoptionApplication.deleteMany();
  await prisma.petImage.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoAdopter = await prisma.user.create({
    data: {
      email: DEMO_ADOPTER_EMAIL,
      password: hashedPassword,
      name: 'Demo Adopter',
      role: Role.USER,
    },
  });

  const demoAdmin = await prisma.user.create({
    data: {
      email: DEMO_ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Demo Admin',
      role: Role.ADMIN,
    },
  });

  // Filler applicants give the admin review list realistic variety.
  // They have no password and are not meant to be logged into directly.
  const fillerNames = ['Alice Johnson', 'Bob Martinez', 'Carol Nguyen'];
  const fillerUsers = await Promise.all(
    fillerNames.map((name, i) =>
      prisma.user.create({
        data: {
          email: `applicant${i + 1}@example.com`,
          name,
          role: Role.USER,
        },
      })
    )
  );

  return { demoAdopter, demoAdmin, fillerUsers };
}

async function seedShelters() {
  const shelterData = [
    {
      name: 'Sunnyvale Animal Shelter',
      address: '123 Sunnyvale Rd',
      phone: '555-0101',
      email: 'contact@sunnyvale-shelter.example',
    },
    {
      name: 'Riverside Pet Rescue',
      address: '45 Riverside Ave',
      phone: '555-0102',
      email: 'contact@riverside-rescue.example',
    },
    {
      name: 'Greenfield Humane Society',
      address: '78 Greenfield Blvd',
      phone: '555-0103',
      email: 'contact@greenfield-humane.example',
    },
  ];

  return Promise.all(shelterData.map((data) => prisma.shelter.create({ data })));
}

const DOG_NAMES = [
  'Buddy', 'Max', 'Charlie', 'Rocky', 'Bear', 'Duke', 'Zeus', 'Cooper',
  'Tucker', 'Bentley', 'Milo', 'Oscar', 'Leo', 'Jack', 'Toby',
];
const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Beagle',
  'Poodle', 'Bulldog', 'Boxer', 'Husky', 'Dachshund', 'Border Collie',
  'Corgi', 'Shih Tzu', 'Pug', 'Mixed Breed', 'Australian Shepherd',
];
const CAT_NAMES = [
  'Luna', 'Bella', 'Lucy', 'Daisy', 'Lily', 'Nala', 'Cleo', 'Mia',
  'Chloe', 'Stella', 'Zoe', 'Ruby', 'Sophie', 'Coco', 'Olive',
];
const CAT_BREEDS = [
  'Domestic Shorthair', 'Siamese', 'Maine Coon', 'Persian', 'Ragdoll',
  'British Shorthair', 'Bengal', 'Sphynx', 'Russian Blue', 'Scottish Fold',
  'Abyssinian', 'Birman', 'Domestic Longhair', 'Tabby', 'Calico',
];

// Exactly 70% available and 30% adopted across the 30 seeded pets.
const STATUS_CYCLE: PetStatus[] = [
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.AVAILABLE,
  PetStatus.ADOPTED,
  PetStatus.ADOPTED,
  PetStatus.ADOPTED,
];

async function seedPets(shelters: { id: string }[]) {
  const pets: {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: PetGender;
    description: string;
    status: PetStatus;
    shelterId: string;
    imageFile: string;
  }[] = [];

  for (let i = 0; i < 15; i++) {
    const num = String(i + 1).padStart(2, '0');

    pets.push({
      name: DOG_NAMES[i],
      species: SPECIES_DOG,
      breed: DOG_BREEDS[i],
      age: 1 + (i % 8),
      gender: i % 2 === 0 ? PetGender.MALE : PetGender.FEMALE,
      description: `${DOG_NAMES[i]} is a friendly ${DOG_BREEDS[i]} looking for a loving home.`,
      status: STATUS_CYCLE[(i * 2) % STATUS_CYCLE.length],
      shelterId: shelters[i % shelters.length].id,
      imageFile: `dog-${num}.jpg`,
    });

    pets.push({
      name: CAT_NAMES[i],
      species: SPECIES_CAT,
      breed: CAT_BREEDS[i],
      age: 1 + (i % 8),
      gender: i % 2 === 0 ? PetGender.FEMALE : PetGender.MALE,
      description: `${CAT_NAMES[i]} is a sweet ${CAT_BREEDS[i]} looking for a loving home.`,
      status: STATUS_CYCLE[(i * 2 + 1) % STATUS_CYCLE.length],
      shelterId: shelters[(i + 1) % shelters.length].id,
      imageFile: `cat-${num}.jpg`,
    });
  }

  const createdPets = [];
  for (const { imageFile, ...data } of pets) {
    const pet = await prisma.pet.create({
      data: {
        ...data,
        images: {
          create: [{ url: `/pets/${imageFile}`, isPrimary: true }],
        },
      },
    });
    createdPets.push(pet);
  }

  return createdPets;
}

async function seedApplications(
  pets: { id: string; status: PetStatus }[],
  demoAdopter: { id: string },
  demoAdmin: { id: string },
  fillerUsers: { id: string }[]
) {
  const applicants = [demoAdopter, ...fillerUsers];
  let applicantIndex = 0;
  let createdCount = 0;

  for (const pet of pets) {
    const applicant = applicants[applicantIndex % applicants.length];
    applicantIndex++;

    if (pet.status === PetStatus.ADOPTED) {
      await prisma.adoptionApplication.create({
        data: {
          userId: applicant.id,
          petId: pet.id,
          status: ApplicationStatus.APPROVED,
          message: 'I would love to give this pet a forever home.',
          reviewerId: demoAdmin.id,
          reviewedAt: new Date(),
        },
      });
      createdCount++;
    } else if (applicantIndex % 5 === 0) {
      // Pending applications belong to the application, not the pet. Keep the
      // pet available and seed two competing applicants for the admin queue.
      const secondApplicant = applicants[applicantIndex % applicants.length];

      await prisma.adoptionApplication.createMany({
        data: [
          {
            userId: applicant.id,
            petId: pet.id,
            status: ApplicationStatus.PENDING,
            message: 'I have a big yard and experience with this breed.',
          },
          {
            userId: secondApplicant.id,
            petId: pet.id,
            status: ApplicationStatus.PENDING,
            message: 'I can provide a patient and loving home.',
          },
        ],
      });
      createdCount += 2;
    } else if (applicantIndex % 4 === 0) {
      // Sprinkle a few rejected applications onto otherwise-available pets.
      await prisma.adoptionApplication.create({
        data: {
          userId: applicant.id,
          petId: pet.id,
          status: ApplicationStatus.REJECTED,
          message: 'Interested in adopting, please consider my application.',
          reviewerId: demoAdmin.id,
          reviewedAt: new Date(),
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}

/**
 * Wipes all application data and reseeds the database with a fresh demo
 * dataset. Safe to call repeatedly — this is the single source of truth
 * used both by the CLI seed script (prisma/seed.ts) and, later, by the
 * Vercel Cron route that resets the public demo on a daily schedule.
 *
 * Does NOT disconnect Prisma — callers own the connection lifecycle,
 * since a long-lived Next.js process must not disconnect the shared
 * PrismaClient singleton.
 */
export async function resetAndSeedDatabase() {
  await resetDatabase();
  const { demoAdopter, demoAdmin, fillerUsers } = await seedUsers();
  const shelters = await seedShelters();
  const pets = await seedPets(shelters);
  const applicationCount = await seedApplications(pets, demoAdopter, demoAdmin, fillerUsers);

  return {
    userCount: 2 + fillerUsers.length,
    shelterCount: shelters.length,
    petCount: pets.length,
    applicationCount,
    demoAdopterEmail: demoAdopter.email,
    demoAdminEmail: demoAdmin.email,
  };
}
