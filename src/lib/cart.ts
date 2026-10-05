// Demo cart: lives in localStorage only, never takes payment.
export interface CartItem {
  id: string;
  name: string;
  option: string;
  price: number;
  qty: number;
  image: string;
}

const KEY = 'dogpark-cart';

export function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: cart just won't persist */
  }
  window.dispatchEvent(new Event('cart:change'));
}

export function addToCart(item: Omit<CartItem, 'qty'>) {
  const items = readCart();
  const existing = items.find((i) => i.id === item.id && i.option === item.option);
  if (existing) existing.qty = Math.min(existing.qty + 1, 10);
  else items.push({ ...item, qty: 1 });
  writeCart(items);
}

export const cartCount = () => readCart().reduce((n, i) => n + i.qty, 0);

export const toast = (msg: string) => window.dispatchEvent(new CustomEvent('toast', { detail: msg }));
