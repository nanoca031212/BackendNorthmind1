import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const searchTerm = "Gorham Glossed";
  console.log(`Searching for products containing "${searchTerm}"...`);

  const products = await prisma.produto.findMany({
    where: {
      nome: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    }
  });

  if (products.length === 0) {
    console.log("No products found. Listing all available products instead:");
    const all = await prisma.produto.findMany({
      select: { nome: true, handle: true }
    });
    console.log(all);
    return;
  }

  console.log(`Found ${products.length} matching products:`);
  for (const p of products) {
    console.log(`- Current Price: £${p.preco} | Old Price: £${p.precoOriginal}`);
    console.log(`- New Price: £99.00 | New Original Price: £199.00`);

    // Attempt update
    const updated = await prisma.produto.update({
      where: { id: p.id },
      data: { 
        preco: 99.00,
        precoOriginal: 199.00
      }
    });
    
    console.log(`  ✓ Successfully updated to £99.00\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
