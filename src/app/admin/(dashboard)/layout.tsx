import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './AdminSidebar';
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
    <div className="admin-shell">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="admin-content">{children}</main>
    </div>
  );
}
