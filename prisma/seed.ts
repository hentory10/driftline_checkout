import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Surf Levels
  const beginner = await prisma.surfLevel.create({ data: { level: 'beginner' } });
  const intermediate = await prisma.surfLevel.create({ data: { level: 'intermediate' } });
  const advanced = await prisma.surfLevel.create({ data: { level: 'advanced' } });

  // Destinations
  const bali = await prisma.destination.create({
    data: { name: 'Bali' },
  });

  // Packages
  const pkg1 = await prisma.package.create({
    data: {
      name: 'SURF CAMP PACKAGE',
      description: 'This is for you who are excited to surf tropical waves and progress in warm, consistent conditions, no matter your surf level.',
      price: 497,
      destinationId: bali.id,
      surfLevels: { connect: [{ id: beginner.id }, { id: intermediate.id }, { id: advanced.id }] },
    },
  });
  const pkg2 = await prisma.package.create({
    data: {
      name: 'Intermediate Escape',
      description: 'For those ready to progress.',
      price: 800,
      destinationId: bali.id,
      surfLevels: { connect: [{ id: intermediate.id }, { id: advanced.id }] },
    },
  });
  const pkg3 = await prisma.package.create({
    data: {
      name: 'Advanced Adventure',
      description: 'Chase the biggest waves.',
      price: 1000,
      destinationId: bali.id,
      surfLevels: { connect: [{ id: advanced.id }] },
    },
  });

  // Rooms
  await prisma.room.createMany({
    data: [
      {
        name: 'Shared Dorm',
        description: 'Social and affordable.',
        price: 30,
        capacity: 6,
      },
      {
        name: 'Private Double',
        description: 'Cozy for two.',
        price: 70,
        capacity: 2,
      },
      {
        name: 'Ocean Suite',
        description: 'Luxury with a view.',
        price: 150,
        capacity: 2,
      },
    ],
  });

  // AddOns
  await prisma.addOn.createMany({
    data: [
      { name: 'Yoga Classes', price: 50 },
      { name: 'Airport Transfer', price: 30 },
      { name: 'Surfboard Rental', price: 40 },
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 