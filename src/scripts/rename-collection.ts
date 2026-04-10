import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const oldName = "3x1 Fragrances"; // Case-insensitive in your description but stored as this
  const newName = "Fragrance Sets";
  const newHandle = "fragrance-sets";

  console.log(`Renaming collection from "${oldName}" to "${newName}"...`);

  // 1. Find the collection
  const collection = await prisma.collection.findFirst({
    where: {
      name: {
        contains: "3x1",
        mode: "insensitive",
      },
    },
  });

  if (!collection) {
    console.log("No collection found with '3x1' in the name.");
  } else {
    // Update the collection
    const updatedCollection = await prisma.collection.update({
      where: { id: collection.id },
      data: {
        name: newName,
        handle: newHandle,
      },
    });
    console.log(`Updated collection: ${updatedCollection.name} (handle: ${updatedCollection.handle})`);

    // 2. Update all products that belong to this collection
    // In your schema, Produto uses a string field 'collection'
    const result = await prisma.produto.updateMany({
      where: {
        collection: collection.name,
      },
      data: {
        collection: newName,
      },
    });
    console.log(`Updated ${result.count} products.`);
  }

  console.log("Renaming complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
