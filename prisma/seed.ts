import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TREE: Record<string, string[]> = {
  Men: ["Shirts & Kurta", "Jackets", "Trousers"],
  Women: ["Kurtis", "Dupatta & Sets", "Dresses"],
  Kids: ["Hoodies", "Sandals", "Dresses"],
  Shoes: ["Sneakers", "Formal", "Sandals"],
  Bags: ["Handbags", "Backpacks"],
  Beauty: ["Lipsticks", "Creams & Serums", "Powders & Compacts"],
  Jewellery: ["Earrings", "Necklaces"],
  Mobile: ["Covers", "Chargers"],
  Electronics: ["Earbuds", "Power Banks"],
  "Home & Kitchen": ["Bottles", "Cookware"],
  Sports: ["Yoga & Fitness"],
  Groceries: ["Honey & Spreads"],
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  for (const [main, subs] of Object.entries(TREE)) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(main) },
      update: {},
      create: { name: main, slug: slugify(main) },
    });
    for (const sub of subs) {
      await prisma.category.upsert({
        where: { slug: slugify(sub) },
        update: {},
        create: { name: sub, slug: slugify(sub), parentId: parent.id },
      });
    }
  }

  // Aapka apna store (commission 0%)
  const owner = await prisma.user.upsert({
    where: { phone: "9800000001" },
    update: {},
    create: { name: "Ajay", phone: "9800000001", role: "ADMIN" },
  });
  await prisma.seller.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      shopName: "Ajay Fashion House",
      shopSlug: "ajay-fashion-house",
      isPlatformOwned: true,
      commissionRate: 0,
      status: "APPROVED",
    },
  });

  // Ek sample third-party seller
  const u2 = await prisma.user.upsert({
    where: { phone: "9800000002" },
    update: {},
    create: { name: "Sample Seller", phone: "9800000002", role: "SELLER" },
  });
  await prisma.seller.upsert({
    where: { userId: u2.id },
    update: {},
    create: {
      userId: u2.id,
      shopName: "Kathmandu Kicks",
      shopSlug: "kathmandu-kicks",
      commissionRate: 0.10,
      status: "APPROVED",
    },
  });
  console.log("Seed complete");
}

main().finally(() => prisma.$disconnect());
