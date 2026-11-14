import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// POST: admin seller ko approve kare
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return Response.json({ error: "Not allowed" }, { status: 403 });

  const seller = await prisma.seller.update({
    where: { id: params.id },
    data: { status: "APPROVED" },
  });
  return Response.json(seller);
}
