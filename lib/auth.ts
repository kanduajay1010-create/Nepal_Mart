import { prisma } from "./prisma";

// ⚠️ ZAROORI: Ye temporary login hai. Live karne se pehle NextAuth ya Clerk
// se real login lagana zaroori hai. Abhi ke liye sirf development mein
// "x-user-id" header se user pehchana jaata hai.
export async function getCurrentUser(req: Request) {
  if (process.env.NODE_ENV === "production") return null;
  const id = req.headers.get("x-user-id");
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, include: { seller: true } });
}

export async function requireApprovedSeller(req: Request) {
  const user = await getCurrentUser(req);
  if (!user?.seller || user.seller.status !== "APPROVED") return null;
  return user.seller;
}

export async function requireAdmin(req: Request) {
  const user = await getCurrentUser(req);
  return user?.role === "ADMIN" ? user : null;
}
