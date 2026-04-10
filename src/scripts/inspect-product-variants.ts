import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const handle = "the-gorham-glossed-down-jacket";
  console.log(`Inspecting product details for "${handle}"...`);

  const product = await prisma.produto.findUnique({
    where: { handle: handle },
    select: {
      id: true,
      nome: true,
      handle: true,
      preco: true,
      precoOriginal: true,
      variantes: true
    }
  });

  if (!product) {
    console.log("Product not found. Listing all to help find it:");
    const all = await prisma.produto.findMany({ select: { handle: true, nome: true }, take: 20 });
    console.log(all);
    return;
  }

  console.log("Product found in database:");
  console.log(JSON.stringify(product, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
