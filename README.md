# Nepal Mart - Backend

## Setup (local)
1. `npm install`
2. `.env.example` ko `.env` naam se copy karein aur DATABASE_URL bharein
3. `npx prisma migrate dev --name init`
4. `npm run db:seed`
5. `npm run dev`  -> http://localhost:3000

## Main APIs
- GET  /api/categories
- GET  /api/products?category=beauty&sub=lipsticks
- POST /api/orders                    (customer order, stock aur commission server par)
- GET/POST /api/seller/products       (seller: apne products)
- PATCH /api/seller/products/:id      (seller: edit / stock / hide)
- GET  /api/seller/orders             (seller: apne sub-orders)
- POST /api/admin/sellers/:id/approve (admin)

Testing ke liye header bhejein: `x-user-id: <user id>` (sirf development mein).

## Live karne se pehle zaroori
- Real login (NextAuth ya Clerk). lib/auth.ts mein TODO hai.
- eSewa / Khalti payment integration.
- Images ke liye Cloudinary signed upload.
- Admin panel UI aur seller registration form.
- Payout system.
- Rate limiting aur HTTPS.
