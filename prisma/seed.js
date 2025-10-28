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

  // Create 1 question for the level
  const question = await prisma.question.create({
    data: {
      text: 'What is the correct answer based on the images?',
      testLevelId: testLevel.id,
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

  // Create 4 images for the question
  for (let i = 1; i <= 4; i++) {
    await prisma.image.create({
      data: {
        url: `https://example.com/image${i}.jpg`, // Replace with actual image URLs
        questionId: question.id,
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

  console.log('Seeded database with 4 images, each with 1 question and 4 options.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
