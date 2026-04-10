import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const productsFilePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "products.json",
  );
  const data = JSON.parse(fs.readFileSync(productsFilePath, "utf8"));
  const products = data.products;

  console.log("Syncing original prices from products.json to database...");

  const outerwearPrices = [195, 225, 255, 199, 219, 259, 198, 240];

  for (const product of products) {
    if (product.collection === "Outerwear") {
      // Use deterministic index from handle to pick from the list
      const seed = product.handle
        .split("")
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const price = outerwearPrices[seed % outerwearPrices.length];

      console.log(
        `Updating product "${product.title}" (ID: ${product.id}) with originalPrice: £${price}`,
      );

      const updated = await prisma.produto.update({
        where: { handle: product.handle },
        data: {
          precoOriginal: price,
        },
      });

      console.log(`✓ Updated "${updated.nome}"`);
    }
  }

  console.log("Price sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
