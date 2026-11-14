// Marketplace ka sabse important rule: commission kitna lagega aur seller ko kitna milega
export function splitEarnings(subtotal: number, rate: number) {
  const commission = Math.round(subtotal * rate);
  return { commission, sellerEarning: subtotal - commission };
}
