import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApprovedSeller } from "@/lib/auth";

// PATCH: product edit ya stock update. Seller sirf apna product badal sakta hai.
const Update = z.object({
  name: z.string().min(3).max(120).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "HIDDEN"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const seller = await requireApprovedSeller(req);
  if (!seller) return Response.json({ error: "Not allowed" }, { status: 403 });

  const parsed = Update.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await prisma.product.updateMany({
    where: { id: params.id, sellerId: seller.id },
    data: parsed.data,
  });
  if (result.count === 0) return Response.json({ error: "Product nahi mila" }, { status: 404 });
  return Response.json({ ok: true });
}
