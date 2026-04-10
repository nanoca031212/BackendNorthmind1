import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const handle = "the-gorham-glossed-down-jacket";
  const newPrice = 99.00;
  const newOriginalPrice = 199.00;

  console.log(`Updating full pricing for "${handle}"...`);

  const product = await prisma.produto.findUnique({
    where: { handle: handle }
  });

  if (!product) {
    console.error(`Error: Product with handle "${handle}" not found.`);
    return;
  }

  // Update Variants JSON
  let variants = product.variantes as any[];
  if (variants && Array.isArray(variants)) {
    variants = variants.map(v => {
      if (v.label === "SINGLE PACK" || v.name?.toUpperCase().includes("SINGLE")) {
        return { ...v, price: newPrice, originalPrice: newOriginalPrice };
      }
      if (v.label === "DUO PACK" || v.name?.toUpperCase().includes("DUO")) {
        // Apply a small discount for bundles if desired, or just use pro-rated
        const duoPrice = Number((newPrice * 2 * 0.9).toFixed(2)); // 10% bundle discount
        return { ...v, price: duoPrice, originalPrice: newOriginalPrice * 2 };
      }
      if (v.label === "TRIPLE PACK" || v.name?.toUpperCase().includes("TRIPLE")) {
        const triplePrice = Number((newPrice * 3 * 0.85).toFixed(2)); // 15% bundle discount
        return { ...v, price: triplePrice, originalPrice: newOriginalPrice * 3 };
      }
      return v;
    });
  }

  const updated = await prisma.produto.update({
    where: { id: product.id },
    data: {
      preco: newPrice,
      precoOriginal: newOriginalPrice,
      variantes: variants || undefined
    }
  });

  console.log(`✓ Successfully updated "${updated.nome}"`);
  console.log(`- New Base Price: £${updated.preco}`);
  console.log(`- New Original Price: £${updated.precoOriginal}`);
  console.log(`- Variants updated: ${variants ? variants.length : 0}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
