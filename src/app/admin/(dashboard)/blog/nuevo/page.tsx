import Link from 'next/link';
import BlogForm from '../BlogForm';

export default function NuevoArticuloPage() {
  return (
    <div>
      <Link href="/admin/blog" className="admin-back-link">← Volver al blog</Link>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-forum">Nuevo artículo</h1>
          <p className="admin-subtitle">Complétalo y publícalo cuando esté listo.</p>
        </div>
      </div>
      <BlogForm />
    </div>
  );
}
