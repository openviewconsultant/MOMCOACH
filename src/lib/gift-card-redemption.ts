import type { createAdminClient } from '@/lib/supabase/admin';
import { normalizeGiftCardCode, GIFT_CARD_PROGRAM_CATEGORY, GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { GiftCard, Product } from '@/lib/types';

type AdminClient = ReturnType<typeof createAdminClient>;

export interface RedemptionResult {
  ok: true;
  giftCard: GiftCard;
  /** Descuento a aplicar sobre esta compra (USD enteros). */
  discount: number;
  /** Subtotal de los items del carrito elegibles para este programa. */
  eligibleSubtotal: number;
  programLabel: string;
}

export interface RedemptionError {
  ok: false;
  error: string;
  status: number;
}

/**
 * Valida un código de gift card contra un carrito y calcula cuánto se puede
 * descontar. Regla: la gift card solo paga productos de su programa
 * (categoría), y el descuento es min(saldo, subtotal elegible).
 */
export async function evaluateGiftCard(
  supabase: AdminClient,
  rawCode: string,
  cartItems: { productId: string; quantity: number; price: number; category: string }[]
): Promise<RedemptionResult | RedemptionError> {
  const code = normalizeGiftCardCode(rawCode);
  if (!/^TMC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    return { ok: false, error: 'El código no tiene un formato válido', status: 400 };
  }

  const { data, error } = await supabase.from('gift_cards').select('*').eq('code', code).maybeSingle();
  const giftCard = data as GiftCard | null;
  if (error || !giftCard) {
    return { ok: false, error: 'No encontramos una gift card con ese código', status: 404 };
  }
  if (giftCard.status === 'pending') {
    return { ok: false, error: 'Esta gift card aún no está activa. Se activa cuando el pago se confirma.', status: 409 };
  }
  if (giftCard.status === 'cancelled') {
    return { ok: false, error: 'Esta gift card fue cancelada', status: 409 };
  }
  if (giftCard.balance <= 0 || giftCard.status === 'depleted') {
    return { ok: false, error: 'Esta gift card ya no tiene saldo disponible', status: 409 };
  }

  const eligibleCategory = GIFT_CARD_PROGRAM_CATEGORY[giftCard.program];
  const programLabel = GIFT_CARD_PROGRAM_LABEL[giftCard.program];
  const eligibleSubtotal = cartItems
    .filter((item) => item.category === eligibleCategory)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (eligibleSubtotal <= 0) {
    return {
      ok: false,
      error: `Esta gift card solo sirve para productos del ${programLabel}. Agrega alguno al carrito.`,
      status: 409,
    };
  }

  const discount = Math.min(giftCard.balance, eligibleSubtotal);
  return { ok: true, giftCard, discount, eligibleSubtotal, programLabel };
}

/** Construye la lista de items con categoría a partir de ids + cantidades. */
export async function loadCartItemsWithCategory(
  supabase: AdminClient,
  requested: { id: string; quantity: number }[]
): Promise<{ productId: string; quantity: number; price: number; category: string; title: string }[]> {
  const ids = requested.map((r) => r.id);
  const { data: products } = await supabase
    .from('products')
    .select('id, price, category, title')
    .in('id', ids)
    .eq('is_published', true);
  const byId = new Map((products ?? []).map((p: Pick<Product, 'id' | 'price' | 'category' | 'title'>) => [p.id, p]));
  return requested
    .map((r) => {
      const p = byId.get(r.id);
      if (!p) return null;
      return { productId: r.id, quantity: r.quantity, price: p.price, category: p.category, title: p.title };
    })
    .filter((x): x is { productId: string; quantity: number; price: number; category: string; title: string } => x !== null);
}

/**
 * Descuenta el monto de la gift card y registra la redención. Idempotente por
 * (gift_card_id, order_id). Devuelve true si quedó aplicada.
 */
export async function applyGiftCardRedemption(
  supabase: AdminClient,
  code: string,
  orderId: string,
  amount: number
): Promise<boolean> {
  const { data: card } = await supabase.from('gift_cards').select('*').eq('code', code).maybeSingle();
  const giftCard = card as GiftCard | null;
  if (!giftCard) return false;

  const { data: existing } = await supabase
    .from('gift_card_redemptions')
    .select('id')
    .eq('gift_card_id', giftCard.id)
    .eq('order_id', orderId)
    .maybeSingle();
  if (existing) return true;

  const applied = Math.min(amount, giftCard.balance);
  if (applied <= 0) return false;

  const { error: redErr } = await supabase
    .from('gift_card_redemptions')
    .insert({ gift_card_id: giftCard.id, order_id: orderId, amount: applied });
  if (redErr) {
    console.error('Error registrando redención de gift card', redErr);
    return false;
  }

  const newBalance = giftCard.balance - applied;
  await supabase
    .from('gift_cards')
    .update({
      balance: newBalance,
      status: newBalance <= 0 ? 'depleted' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', giftCard.id);
  return true;
}
