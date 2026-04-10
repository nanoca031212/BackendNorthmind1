import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const oldName = "Jackets";
  const newName = "Outerwear";
  const newHandle = "outerwear";

  console.log(`Renaming collection from "${oldName}" to "${newName}"...`);

  // 1. Find the collection
  const collection = await prisma.collection.findUnique({
    where: { name: oldName },
  });

  if (!collection) {
    console.log(`No collection found with the name "${oldName}". Checking if it's already renamed...`);
    const alreadyRenamed = await prisma.collection.findUnique({
      where: { name: newName },
    });
    
    if (alreadyRenamed) {
      console.log(`Collection "${newName}" already exists.`);
    } else {
      console.log("Could not find the collection to rename.");
    }
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
    const result = await prisma.produto.updateMany({
      where: {
        collection: oldName,
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
