import { prisma } from "@/lib/prisma";

// GET /api/categories -> main categories aur unki subcategories
export async function GET() {
  const mains = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });
  return Response.json(mains);
}
