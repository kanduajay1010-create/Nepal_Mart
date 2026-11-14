import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { splitEarnings } from "@/lib/commission";

const OrderInput = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  paymentType: z.enum(["cod", "esewa", "khalti"]),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
});

// POST /api/orders
// Price aur stock server par check hote hain, frontend par bharosa nahi
export async function POST(req: Request) {
  const parsed = OrderInput.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const { items, ...info } = parsed.data;
  const user = await getCurrentUser(req);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) }, status: "ACTIVE" },
        include: { seller: true },
      });

      // Har item ka stock ghatao. Agar stock kam hai to poora order fail
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error("Product available nahi hai");
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) throw new Error(`${product.name} ka stock kam hai`);
      }

      // Seller-wise sub-orders banao
      const groups = new Map<string, { seller: any; lines: { productId: string; quantity: number; price: number }[] }>();
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const g = groups.get(product.sellerId) ?? { seller: product.seller, lines: [] };
        g.lines.push({ productId: product.id, quantity: item.quantity, price: product.price });
        groups.set(product.sellerId, g);
      }

      let total = 0;
      const subOrders = [...groups.values()].map((g) => {
        const subtotal = g.lines.reduce((s, l) => s + l.price * l.quantity, 0);
        const { commission, sellerEarning } = splitEarnings(subtotal, g.seller.commissionRate);
        total += subtotal;
        return {
          sellerId: g.seller.id,
          subtotal, commission, sellerEarning,
          items: { create: g.lines },
        };
      });

      return tx.order.create({
        data: { ...info, total, customerId: user?.id ?? null, subOrders: { create: subOrders } },
        include: { subOrders: { include: { items: true } } },
      });
    });

    return Response.json(order, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Order fail hua" }, { status: 409 });
  }
}
