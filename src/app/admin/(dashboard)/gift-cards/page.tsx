import { createAdminClient } from '@/lib/supabase/admin';
import { formatUSD } from '@/lib/format';
import type { GiftCard } from '@/lib/types';
import GiftCardsTable, { type Redemption } from './GiftCardsTable';
import TestEmailForm from './TestEmailForm';

export default async function AdminGiftCardsPage() {
  const supabase = createAdminClient();
  const { data: cardsData } = await supabase
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });
  const cards = (cardsData ?? []) as GiftCard[];

  const { data: redData } =
    cards.length > 0
      ? await supabase
          .from('gift_card_redemptions')
          .select('gift_card_id, order_id, amount, created_at')
          .in(
            'gift_card_id',
            cards.map((c) => c.id)
          )
          .order('created_at', { ascending: false })
      : { data: [] as Redemption[] };
  const redemptions = (redData ?? []) as Redemption[];

  const active = cards.filter((c) => c.status === 'active' || c.status === 'depleted');
  const totalIssued = active.reduce((s, c) => s + c.initial_amount, 0);
  const outstanding = cards
    .filter((c) => c.status === 'active')
    .reduce((s, c) => s + c.balance, 0);
  const redeemed = redemptions.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Gift Cards</h1>
          <p className="admin-subtitle">
            Contabilidad de tarjetas de regalo: emitidas, canjeadas y saldo pendiente.{' '}
            <a href="/admin/gift-cards/vista-previa" style={{ color: 'var(--color-turquoise)' }}>
              Ver ejemplo del correo →
            </a>
          </p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Tarjetas</div>
          <div className="admin-stat-value">{cards.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Activas</div>
          <div className="admin-stat-value">{cards.filter((c) => c.status === 'active').length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total emitido (pagadas)</div>
          <div className="admin-stat-value">{formatUSD(totalIssued)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Canjeado</div>
          <div className="admin-stat-value">{formatUSD(redeemed)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Saldo pendiente</div>
          <div className="admin-stat-value">{formatUSD(outstanding)}</div>
        </div>
      </div>

      <TestEmailForm />

      {cards.length === 0 ? (
        <p className="admin-empty">Aún no se han comprado gift cards.</p>
      ) : (
        <GiftCardsTable cards={cards} redemptions={redemptions} />
      )}
    </div>
  );
}
