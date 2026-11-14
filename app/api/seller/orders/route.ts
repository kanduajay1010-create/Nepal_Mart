import { prisma } from "@/lib/prisma";
import { requireApprovedSeller } from "@/lib/auth";

// Seller ko sirf apne sub-orders dikhte hain, poora order nahi
export async function GET(req: Request) {
  const seller = await requireApprovedSeller(req);
  if (!seller) return Response.json({ error: "Not allowed" }, { status: 403 });

  const subOrders = await prisma.subOrder.findMany({
    where: { sellerId: seller.id },
    orderBy: { id: "desc" },
    include: {
      order: { select: { id: true, name: true, phone: true, address: true, createdAt: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
  return Response.json(subOrders);
}
