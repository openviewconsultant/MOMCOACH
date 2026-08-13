import Link from 'next/link';
import ProductForm from '../ProductForm';
import { getCalendarOptions } from '@/lib/calendarOptions';

export default async function NuevoProductoPage() {
  const calendarOptions = await getCalendarOptions();

  return (
    <div>
      <Link href="/admin/productos" className="admin-back-link">← Volver a productos</Link>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-forum">Nuevo producto</h1>
          <p className="admin-subtitle">Complétalo y publícalo cuando esté listo.</p>
        </div>
      </div>
      <ProductForm calendarOptions={calendarOptions} />
    </div>
  );
}
