import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '../actions';
import '../admin.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-main">
      <div className="admin-container">
        <nav className="admin-nav">
          <div className="admin-nav-links">
            <Link href="/admin/productos">Productos</Link>
            <Link href="/admin/pedidos">Pedidos</Link>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="admin-signout-btn">Cerrar sesión</button>
          </form>
        </nav>
        {children}
      </div>
    </div>
  );
}
