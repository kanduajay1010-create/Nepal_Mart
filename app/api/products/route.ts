import { prisma } from "@/lib/prisma";

// GET /api/products?category=beauty&sub=lipsticks&page=1
// Customers ko sirf ACTIVE products dikhte hain
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const sub = url.searchParams.get("sub");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = 20;

  const where: any = { status: "ACTIVE" };
  if (sub) {
    where.category = { slug: sub };
  } else if (category) {
    where.category = { OR: [{ slug: category }, { parent: { slug: category } }] };
  }

  const products = await prisma.product.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, price: true, stock: true, images: true, sizes: true,
      category: { select: { name: true, slug: true } },
      seller: { select: { shopName: true, isPlatformOwned: true } },
    },
  });
  return Response.json(products);
}
