'use client';

import { formatUSD, formatDateTimeCO } from '@/lib/format';
import { GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';
import type { GiftCard } from '@/lib/types';
import { useBulkDelete } from '../useBulkDelete';
import { deleteGiftCardsAction, deleteAllGiftCardsAction } from '../../actions';

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

export interface Redemption {
  gift_card_id: string;
  order_id: string | null;
  amount: number;
  created_at: string;
}

export default function GiftCardsTable({
  cards,
  redemptions,
}: {
  cards: GiftCard[];
  redemptions: Redemption[];
}) {
  const redByCard = new Map<string, Redemption[]>();
  for (const r of redemptions) {
    const list = redByCard.get(r.gift_card_id) ?? [];
    list.push(r);
    redByCard.set(r.gift_card_id, list);
  }

  const { selected, toggleOne, toggleAll, allSelected, bar } = useBulkDelete({
    allIds: cards.map((c) => c.id),
    deleteSelected: deleteGiftCardsAction,
    deleteAll: deleteAllGiftCardsAction,
    labels: { one: 'gift card', many: 'gift cards' },
  });

  return (
    <>
      {bar}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" />
              </th>
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
                <tr key={card.id} className={selected.has(card.id) ? 'is-selected' : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(card.id)}
                      onChange={() => toggleOne(card.id)}
                      aria-label="Seleccionar gift card"
                    />
                  </td>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{card.code}</td>
                  <td className="admin-cell-wrap">{GIFT_CARD_PROGRAM_LABEL[card.program]}</td>
                  <td>
                    {formatUSD(card.initial_amount)}
                    {card.status !== 'pending' && (
                      <span className="admin-table-subtext">saldo {formatUSD(card.balance)}</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge ${STATUS_BADGE[card.status]}`}>{STATUS_LABEL[card.status]}</span>
                  </td>
                  <td className="admin-cell-wrap">{card.purchaser_email}</td>
                  <td className="admin-cell-wrap">
                    {card.recipient_name ? `${card.recipient_name} · ` : ''}
                    {card.recipient_email}
                    {card.message && <span className="admin-table-subtext">“{card.message}”</span>}
                  </td>
                  <td>{formatDateTimeCO(card.created_at)}</td>
                  <td className="admin-cell-wrap">
                    {reds.length === 0
                      ? '—'
                      : reds.map((r, i) => (
                          <span key={i} className="admin-table-subtext" style={{ opacity: 0.8 }}>
                            −{formatUSD(r.amount)} · {formatDateTimeCO(r.created_at)}
                          </span>
                        ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
