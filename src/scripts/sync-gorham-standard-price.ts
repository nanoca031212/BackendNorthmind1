import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const handle = "the-gorham-down-jacket";
  const newPrice = 99.00;
  const newOriginalPrice = 196.00;

  console.log(`Syncing "${handle}" to Database with Price: £${newPrice} and Original: £${newOriginalPrice}...`);

  // Search for the product (using contains to be safe with suffixes)
  const products = await prisma.produto.findMany({
    where: {
      handle: { contains: handle, mode: "insensitive" }
    }
  });

  if (products.length === 0) {
    console.error(`Error: Product "${handle}" not found in DB.`);
    return;
  }

  for (const product of products) {
    console.log(`\nFound: "${product.nome}" (ID: ${product.id})`);

    // Update Variants JSON (Bundles)
    let variants = product.variantes as any[];
    if (variants && Array.isArray(variants)) {
      console.log(`Updating ${variants.length} bundle variants...`);
      variants = variants.map(v => {
        const label = (v.label || v.name || "").toUpperCase();
        if (label.includes("SINGLE")) {
          return { ...v, price: newPrice, originalPrice: newOriginalPrice };
        }
        if (label.includes("DUO")) {
          const duoPrice = Number((newPrice * 2 * 0.9).toFixed(2));
          return { ...v, price: duoPrice, originalPrice: newOriginalPrice * 2 };
        }
        if (label.includes("TRIPLE")) {
          const triplePrice = Number((newPrice * 3 * 0.85).toFixed(2));
          return { ...v, price: triplePrice, originalPrice: newOriginalPrice * 3 };
        }
        return v;
      });
    }

    await prisma.produto.update({
      where: { id: product.id },
      data: {
        preco: newPrice,
        precoOriginal: newOriginalPrice,
        variantes: variants || undefined
      }
    });

    console.log(`  ✓ Successfully updated in DB.`);
  }

  console.log("\n✨ Sync complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
