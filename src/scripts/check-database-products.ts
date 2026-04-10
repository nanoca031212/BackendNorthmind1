import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.produto.findMany({
    select: {
      id: true,
      nome: true,
      handle: true,
      collection: true,
      precoOriginal: true,
      preco: true
    }
  });

  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
