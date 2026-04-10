import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const handle = "the-gorham-glossed-down-jacket";
  const newPrice = 99.00;

  console.log(`Updating price for "${handle}" to £${newPrice}...`);

  const updated = await prisma.produto.update({
    where: { handle: handle },
    data: {
      preco: newPrice
    }
  });

  console.log(`✓ Updated "${updated.nome}". Current price is now £${updated.preco}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
