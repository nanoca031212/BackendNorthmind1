import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pricingMap = [
  { name: "Quilted Barn Jacket", price: 99.00, original: 255.00 },
  { name: "Bi-Swing Jacket", price: 39.00, original: 175.00 },
  { name: "The Gorham Down Jacket", price: 59.00, original: 185.00 },
  { name: "Men’s 1996 Retro Nuptse Jacket", price: 49.00, original: 175.00 },
  { name: "The Gorham Glossed Down Jacket", price: 99.00, original: 255.00 },
  { name: "The Wyoming Ripstop Down Jacket", price: 79.00, original: 229.00 },
  { name: "The Colden Packable Down Jacket", price: 69.00, original: 195.00 },
  { name: "The Wyoming Corduroy Down Jacket", price: 99.00, original: 255.00 }
];

async function main() {
  console.log("📜 Reverting prices to match screenshots...");

  for (const item of pricingMap) {
    console.log(`Processing "${item.name}"...`);

    // Search for the product by name or handle
    const products = await prisma.produto.findMany({
      where: {
        OR: [
          { nome: { contains: item.name, mode: "insensitive" } },
          { handle: { contains: item.name.toLowerCase().replace(/ /g, "-"), mode: "insensitive" } }
        ]
      }
    });

    if (products.length === 0) {
      console.warn(`⚠️ Warning: Product "${item.name}" not found.`);
      continue;
    }

    for (const product of products) {
      // Update Variants JSON
      let variants = product.variantes as any[];
      if (variants && Array.isArray(variants)) {
        variants = variants.map(v => {
          const label = (v.label || v.name || "").toUpperCase();
          const isSize = ["S", "M", "L", "XL", "XXL"].includes(label);
          
          if (isSize || label.includes("SINGLE")) {
            return { ...v, price: item.price, originalPrice: item.original };
          }
          if (label.includes("DUO")) {
            return { ...v, price: Number((item.price * 2 * 0.9).toFixed(2)), originalPrice: item.original * 2 };
          }
          if (label.includes("TRIO") || label.includes("TRIPLE")) {
            return { ...v, price: Number((item.price * 3 * 0.85).toFixed(2)), originalPrice: item.original * 3 };
          }
          return { ...v, price: item.price, originalPrice: item.original };
        });
      }

      await prisma.produto.update({
        where: { id: product.id },
        data: {
          preco: item.price,
          precoOriginal: item.original,
          variantes: variants || undefined
        }
      });
      console.log(`   ✓ Updated to £${item.price} (Original £${item.original})`);
    }
  }

  console.log("\n✨ Reversion complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
