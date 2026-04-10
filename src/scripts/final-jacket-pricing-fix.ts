import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const searchTerm = "gorham-glossed";
  const newPrice = 99.00;
  const newOriginalPrice = 199.00;

  console.log(`Searching for product with handle containing "${searchTerm}"...`);

  const products = await prisma.produto.findMany({
    where: {
      handle: { contains: searchTerm, mode: "insensitive" }
    }
  });

  if (products.length === 0) {
    console.error(`Error: Product matching "${searchTerm}" not found in database.`);
    return;
  }

  const product = products[0];
  console.log(`\nFound product: "${product.nome}"`);
  console.log(`Current Handle: ${product.handle}`);
  console.log(`Current Price: £${product.preco} | Original: £${product.precoOriginal}`);

  // Update Variants JSON (Bundles)
  let variants = product.variantes as any[];
  if (variants && Array.isArray(variants)) {
    console.log(`Updating ${variants.length} bundle variants...`);
    variants = variants.map(v => {
      const label = (v.label || v.name || "").toUpperCase();
      
      if (label.includes("SINGLE")) {
        console.log(`- Updating Single Pack: £${v.price} -> £${newPrice}`);
        return { ...v, price: newPrice, originalPrice: newOriginalPrice };
      }
      if (label.includes("DUO")) {
        const duoPrice = Number((newPrice * 2 * 0.9).toFixed(2));
        console.log(`- Updating Duo Pack: £${v.price} -> £${duoPrice}`);
        return { ...v, price: duoPrice, originalPrice: newOriginalPrice * 2 };
      }
      if (label.includes("TRIPLE")) {
        const triplePrice = Number((newPrice * 3 * 0.85).toFixed(2));
        console.log(`- Updating Triple Pack: £${v.price} -> £${triplePrice}`);
        return { ...v, price: triplePrice, originalPrice: newOriginalPrice * 3 };
      }
      return v;
    });
  } else {
    console.log("No variants found to update.");
  }

  const updated = await prisma.produto.update({
    where: { id: product.id },
    data: {
      preco: newPrice,
      precoOriginal: newOriginalPrice,
      variantes: variants || undefined
    }
  });

  console.log(`\n✨ Successfully updated "${updated.nome}" across all fields!`);
  console.log(`- Main Price: £${updated.preco}`);
  console.log(`- Bundle Variants: Updated and synced.`);
  console.log(`- Checkout and cart should now reflect £99.00.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
