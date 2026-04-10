import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Reading database state for Outerwear products...");
  
  const allProducts = await prisma.produto.findMany();
  const outerwear = allProducts.filter(p => 
    ["Outerwear", "Jackets"].some(c => p.collection.toLowerCase().includes(c.toLowerCase()))
  );

  outerwear.forEach(p => {
    console.log(`\nProd: "${p.nome}"`);
    console.log(`- Base Price in DB: £${p.preco} | Original: £${p.precoOriginal}`);
    console.log(`- Variants JSON: ${JSON.stringify(p.variantes, null, 2)}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
