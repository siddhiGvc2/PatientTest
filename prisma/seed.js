const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if TestLevel exists, else create
  let testLevel = await prisma.testLevel.findUnique({
    where: { level: 1 },
  });
  if (!testLevel) {
    testLevel = await prisma.testLevel.create({
      data: {
        level: 1,
      },
    });
  }

  // Create Screen 1 for the test level
  let screen1 = await prisma.screen.findUnique({
    where: {
      testLevelId_screenNumber: {
        testLevelId: testLevel.id,
        screenNumber: 1,
      },
    },
  });
  if (!screen1) {
    screen1 = await prisma.screen.create({
      data: {
        screenNumber: 1,
        testLevelId: testLevel.id,
      },
    });
  }

  // Create 1 question for Screen 1
  const question = await prisma.question.create({
    data: {
      text: 'What is the correct answer based on the images?',
      screenId: screen1.id,
      options: {
        create: [
          { text: 'Option A' },
          { text: 'Option B' },
          { text: 'Option C' },
          { text: 'Option D' },
        ],
      },
    },
  });

  // Create 4 images for the screen
  for (let i = 1; i <= 4; i++) {
    await prisma.image.create({
      data: {
        url: `https://example.com/image${i}.jpg`, // Replace with actual image URLs
        screenId: screen1.id,
      },
    });
  }

  // Set answerId to the correct option (say Option B)
  const options = await prisma.option.findMany({
    where: { questionId: question.id },
  });
  const correctOption = options.find(opt => opt.text === 'Option B');
  await prisma.question.update({
    where: { id: question.id },
    data: { answerId: correctOption.id },
  });

  console.log('Seeded database with 1 screen, 1 question with 4 images and 4 options.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
