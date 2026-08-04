-- Snapshot of the live `orders` / `order_items` schema (Supabase project "momcoach").
-- Applied via Supabase migration `create_ecommerce_schema` (2026-07-27) and tracked
-- remotely in Supabase's own migration history — this file mirrors it in git so the
-- schema can be reviewed without dashboard/MCP access. Not meant to be re-run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null,
  status text not null default 'pending'
    check (status = any (array['pending', 'approved', 'rejected'])),
  mp_payment_id text,
  total integer not null default 0,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  product_id uuid references public.products (id),
  title text not null,
  price integer not null,
  quantity integer not null default 1 check (quantity > 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Only the admin account can read orders/order_items directly. All writes
-- (order creation on checkout, status updates from the Mercado Pago webhook)
-- go through the server-side admin client (service role key), which bypasses
-- RLS — there is deliberately no anon/authenticated INSERT or UPDATE policy,
-- so orders can only be created or mutated by trusted server code, never
-- directly from the browser.
create policy "Admin lee pedidos" on public.orders
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@momcoaching.com');

create policy "Admin lee items de pedidos" on public.order_items
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@momcoaching.com');
