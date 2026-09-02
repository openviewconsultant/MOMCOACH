import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { evaluateGiftCard, loadCartItemsWithCategory } from '@/lib/gift-card-redemption';

export async function POST(request: Request) {
  let payload: { code?: string; items?: { id?: unknown; quantity?: unknown }[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const code = typeof payload.code === 'string' ? payload.code : '';
  if (!code.trim()) {
    return NextResponse.json({ error: 'Escribe el código de tu gift card' }, { status: 400 });
  }

  const requested: { id: string; quantity: number }[] = [];
  for (const entry of Array.isArray(payload.items) ? payload.items : []) {
    const id = typeof entry?.id === 'string' ? entry.id : undefined;
    const quantity = Number(entry?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: 'El carrito contiene datos inválidos' }, { status: 400 });
    }
    requested.push({ id, quantity });
  }
  if (requested.length === 0) {
    return NextResponse.json({ error: 'Agrega productos al carrito antes de aplicar una gift card' }, { status: 400 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
  }

  const cartItems = await loadCartItemsWithCategory(supabase, requested);
  const result = await evaluateGiftCard(supabase, code, cartItems);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    code: result.giftCard.code,
    program: result.giftCard.program,
    programLabel: result.programLabel,
    balance: result.giftCard.balance,
    discount: result.discount,
  });
}
