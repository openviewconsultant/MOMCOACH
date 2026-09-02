import { createClient } from '@/lib/supabase/server';
import { formatUSD, formatDateTimeCO } from '@/lib/format';
import { GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { GiftCard } from '@/lib/types';

const STATUS_LABEL: Record<GiftCard['status'], string> = {
  pending: 'Pendiente de pago',
  active: 'Activa',
  depleted: 'Sin saldo',
  cancelled: 'Cancelada',
};

const STATUS_BADGE: Record<GiftCard['status'], string> = {
  pending: 'pending',
  active: 'published',
  depleted: 'rejected',
  cancelled: 'rejected',
};

interface Redemption {
  gift_card_id: string;
  order_id: string | null;
  amount: number;
  created_at: string;
}

export default async function AdminGiftCardsPage() {
  const supabase = await createClient();
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
  const redByCard = new Map<string, Redemption[]>();
  for (const r of redemptions) {
    const list = redByCard.get(r.gift_card_id) ?? [];
    list.push(r);
    redByCard.set(r.gift_card_id, list);
  }

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
            Contabilidad de tarjetas de regalo: emitidas, canjeadas y saldo pendiente.
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

      {cards.length === 0 ? (
        <p className="admin-empty">Aún no se han comprado gift cards.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Programa</th>
                <th>Monto / Saldo</th>
                <th>Estado</th>
                <th>Compró</th>
                <th>Recibe</th>
                <th>Fecha</th>
                <th>Canjes</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => {
                const reds = redByCard.get(card.id) ?? [];
                return (
                  <tr key={card.id}>
                    <td style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{card.code}</td>
                    <td className="admin-cell-wrap">{GIFT_CARD_PROGRAM_LABEL[card.program]}</td>
                    <td>
                      {formatUSD(card.initial_amount)}
                      {card.status !== 'pending' && (
                        <span className="admin-table-subtext">saldo {formatUSD(card.balance)}</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[card.status]}`}>
                        {STATUS_LABEL[card.status]}
                      </span>
                    </td>
                    <td className="admin-cell-wrap">{card.purchaser_email}</td>
                    <td className="admin-cell-wrap">
                      {card.recipient_name ? `${card.recipient_name} · ` : ''}
                      {card.recipient_email}
                      {card.message && <span className="admin-table-subtext">“{card.message}”</span>}
                    </td>
                    <td>{formatDateTimeCO(card.created_at)}</td>
                    <td className="admin-cell-wrap">
                      {reds.length === 0 ? (
                        '—'
                      ) : (
                        reds.map((r, i) => (
                          <span key={i} className="admin-table-subtext" style={{ opacity: 0.8 }}>
                            −{formatUSD(r.amount)} · {formatDateTimeCO(r.created_at)}
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
