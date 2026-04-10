import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Searching for products that look like the Gorham Glossed jacket...");
  
  const products = await prisma.produto.findMany({
    where: {
      OR: [
        { nome: { contains: "Gorham", mode: "insensitive" } },
        { handle: { contains: "gorham", mode: "insensitive" } }
      ]
    }
  });

  if (products.length === 0) {
    console.log("No matching products found.");
    return;
  }

  console.log(`Found ${products.length} products:`);
  products.forEach(p => {
    console.log(`\nID: ${p.id}`);
    console.log(`Handle: ${p.handle}`);
    console.log(`Nome: ${p.nome}`);
    console.log(`Preço: ${p.preco}`);
    console.log(`Preço Original: ${p.precoOriginal}`);
    console.log(`Variantes: ${JSON.stringify(p.variantes, null, 2)}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
