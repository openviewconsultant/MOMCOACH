-- Sistema de gift cards: compra con monto libre, envío por correo al
-- destinatario con un código, y canje en el carrito (con saldo restante).

create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  program text not null check (program in ('sueno','alimentacion')),
  initial_amount integer not null check (initial_amount > 0),
  balance integer not null check (balance >= 0),
  currency text not null default 'USD',
  purchaser_email text not null,
  recipient_name text,
  recipient_email text not null,
  message text,
  order_id uuid references orders(id),
  status text not null default 'pending' check (status in ('pending','active','depleted','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gift_card_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references gift_cards(id),
  order_id uuid references orders(id),
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists gift_card_redemptions_card_idx on gift_card_redemptions (gift_card_id);

alter table gift_cards enable row level security;
alter table gift_card_redemptions enable row level security;
-- sin políticas públicas: solo el service role (rutas de servidor) puede leer/escribir.

alter table products add column if not exists gift_card_program text
  check (gift_card_program is null or gift_card_program in ('sueno','alimentacion'));

-- Los productos gift card se identifican por gift_card_program NOT NULL
-- (product_type se mantiene 'digital' para no romper el panel de admin).
