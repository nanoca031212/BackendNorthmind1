import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const targetCollections = ["Outerwear", "Jackets"];
  const newPrice = 99.00;
  const newOriginalPrice = 149.00;

  console.log(`🚀 Starting Global Pricing Fix for: ${targetCollections.join(", ")}`);
  console.log(`Target Price: £${newPrice} | Target Original: £${newOriginalPrice}\n`);

  // Fetch all products
  const allProducts = await prisma.produto.findMany();
  
  // Filter for Outerwear/Jackets
  const outerwearProducts = allProducts.filter(p => 
    targetCollections.some(c => p.collection.toLowerCase().includes(c.toLowerCase()))
  );

  console.log(`Found ${outerwearProducts.length} products to update.\n`);

  for (const product of outerwearProducts) {
    console.log(`Updating "${product.nome}"...`);

    // 1. Update Variants JSON
    let variants = product.variantes as any[];
    if (variants && Array.isArray(variants)) {
      variants = variants.map(v => {
        const label = (v.label || v.name || "").toUpperCase();
        
        // Match sizes (S, M, L, XL, XXL, etc.) or Labels (Single, Duo, Trio)
        const isSize = ["S", "M", "L", "XL", "XXL", "XP", "P"].includes(label);
        const isBundle = label.includes("SINGLE") || label.includes("DUO") || label.includes("TRIO") || label.includes("PACK");

        if (isSize || label.includes("SINGLE")) {
          return { ...v, price: newPrice, originalPrice: newOriginalPrice };
        }
        
        if (label.includes("DUO")) {
          return { ...v, price: Number((newPrice * 2 * 0.9).toFixed(2)), originalPrice: newOriginalPrice * 2 };
        }
        
        if (label.includes("TRIO") || label.includes("TRIPLE")) {
          return { ...v, price: Number((newPrice * 3 * 0.85).toFixed(2)), originalPrice: newOriginalPrice * 3 };
        }

        // Catch-all for any other variants to ensure they aren't stuck at 59
        return { ...v, price: newPrice, originalPrice: newOriginalPrice };
      });
    }

    // 2. Update the product record
    await prisma.produto.update({
      where: { id: product.id },
      data: {
        preco: newPrice,
        precoOriginal: newOriginalPrice,
        variantes: variants || undefined
      }
    });

    console.log(`   ✓ Base, Original, and Variants synced.\n`);
  }

  console.log("✨ Global update complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
