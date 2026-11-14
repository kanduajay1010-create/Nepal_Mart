import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApprovedSeller } from "@/lib/auth";

const ProductInput = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  categoryId: z.string(), // subcategory ki id honi chahiye
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1).max(5),
});

// GET: seller apne hi products dekhe
export async function GET(req: Request) {
  const seller = await requireApprovedSeller(req);
  if (!seller) return Response.json({ error: "Not allowed" }, { status: 403 });
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(products);
}

// POST: naya product add karna
export async function POST(req: Request) {
  const seller = await requireApprovedSeller(req);
  if (!seller) return Response.json({ error: "Not allowed" }, { status: 403 });

  const parsed = ProductInput.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category || !category.parentId) {
    return Response.json({ error: "Subcategory chuno" }, { status: 400 });
  }

  // sellerId session se liya gaya hai, request se nahi
  const product = await prisma.product.create({
    data: { ...parsed.data, sellerId: seller.id, status: "ACTIVE" },
  });
  return Response.json(product, { status: 201 });
}
