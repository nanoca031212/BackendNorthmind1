import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const outerwearPrices = [195, 225, 255, 199, 219, 259, 198, 240];
  
  console.log("Fetching all products from database...");
  const allProducts = await prisma.produto.findMany();

  console.log(`Found ${allProducts.length} products total.`);

  // Filter products that belong to Outerwear or Jackets
  const targetProducts = allProducts.filter(p => 
    p.collection.toLowerCase().includes("outerwear") || 
    p.collection.toLowerCase().includes("jacket")
  );

  console.log(`Found ${targetProducts.length} products in Outerwear/Jackets category.`);

  for (const product of targetProducts) {
    // Generate deterministic price from the list
    const seed = product.handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const price = outerwearPrices[seed % outerwearPrices.length];

    console.log(`Updating "${product.nome}" (Collection: ${product.collection})`);
    console.log(`- Current Price: £${product.preco} | Old Price: £${product.precoOriginal}`);
    console.log(`- New Price: £${price}`);

    await prisma.produto.update({
      where: { id: product.id },
      data: {
        precoOriginal: price
      }
    });

    console.log(`✓ Updated successfully.\n`);
  }

  console.log("✨ Force update complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
