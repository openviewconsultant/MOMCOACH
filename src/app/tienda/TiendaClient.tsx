'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import './tienda.css';
import { CartProvider, useCart } from '@/lib/cart-context';
import CartDrawer from '@/components/tienda/CartDrawer';
import DownloadModal from '@/components/tienda/DownloadModal';
import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import { formatCOP } from '@/lib/format';
import type { Product as SupabaseProduct } from '@/lib/types';

type Category = 'Todos' | 'Sueño infantil' | 'Alimentación' | 'Gratuitos' | 'Tarjeta de regalo';

interface StaticProduct {
  title: string;
  price: string;
  img: string;
  category: Exclude<Category, 'Todos'>;
}

const staticProducts: StaticProduct[] = [
  { title: 'Aco muñeco de apego', price: 'USD $25', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/08/the-mom-coach_fotos-por-kevin-molano-ph-_-Theos-Creative-Agency_113-600x600.jpg' },
  { title: 'Plan de Sueño Infantil: 4 meses a 6 años de edad', price: 'USD $260', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2021/03/DSC08615-scaled-e1705349424305-600x600.jpg' },
  { title: 'Llamada de consulta', price: 'USD $65', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/DSC00073-scaled-e1705350168224-600x600.jpg' },
  { title: 'Programa Recién Nacidos – 0 a 4 meses', price: 'USD $95', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/DSC08734-scaled-e1705350733440-600x600.jpg' },
  { title: 'Ebook: Newborn Sleep Shaping Guide', price: 'USD $40', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2021/03/dc34b5_a0d5ef5f657349058beba280c85cd35fmv2.webp' },
  { title: 'Guía: Cómo Solucionar las Siestas Cortas', price: 'USD $16', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2021/03/siestascortas.webp' },
  { title: 'Guía: Destete progresivo, guiado por la madre', price: 'USD $32', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2025/01/Captura-de-pantalla-2025-01-20-a-las-8.41.18%E2%80%AFa.m-600x600.png' },
  { title: 'Guía: Todo lo que debes saber sobre los Picky Eaters', price: 'USD $32', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/10/Captura-de-pantalla-2024-10-08-a-las-11.25.56%E2%80%AFa.-m-600x600.png' },
  { title: 'Guía: Cómo manejar las Regresiones de Sueño', price: 'USD $16', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/regresionessueno.webp' },
  { title: 'Guía: Transición de Siestas', price: 'USD $16', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/transicionsiestas.webp' },
  { title: 'Guía: Sueño, Viajes y Eventos Especiales', price: 'USD $16', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/guiasuenosviajes.webp' },
  { title: 'Guía: Todo sobre el chupo', price: 'USD $12', category: 'Sueño infantil', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/02/Captura-de-Pantalla-2024-02-14-a-las-4.03.27-p.-m-600x600.png' },
  { title: 'Recetario Booster Calórico', price: 'USD $16', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/03/Portada-recetario-Booster-600x600.png' },
  { title: 'Asesoría en alimentación para Picky Eaters', price: 'USD $120', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/nathan-dumlao-ns1xhGumyH8-unsplash_edited.webp' },
  { title: 'Curso para el Inicio de la Alimentación Complementaria', price: 'USD $85', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Bebe-comiendo-feliz-2-600x600.jpg' },
  { title: 'Recetario: Postres Saludables', price: 'USD $10', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Captura-de-Pantalla-2024-01-25-a-las-8.39.56-p.-m-600x600.png' },
  { title: 'Recetario - The Mom Coach', price: 'USD $18', category: 'Alimentación', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Imagen-principal-recetario--600x600.jpg' },
  { title: 'Material descargable gratuito', price: 'USD $0', category: 'Gratuitos', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/02/descargable-gratuito-600x600.jpg' },
  { title: 'Gift Card', price: 'USD $25–USD $200', category: 'Tarjeta de regalo', img: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Tarjeta-de-regalo-TMC-PRODUCT-600x600.jpg' },
];

const baseCategories: Category[] = ['Todos', 'Sueño infantil', 'Alimentación', 'Gratuitos', 'Tarjeta de regalo'];

const WHATSAPP_NUMBER = '573102158656';

function whatsappHref(title: string, price: string) {
  const text = `Hola! Me interesa: ${title} (${price})`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function SupabaseProductCard({
  product,
  onDownloadClick,
}: {
  product: SupabaseProduct;
  onDownloadClick: (p: SupabaseProduct) => void;
}) {
  const { addBook, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const isFree = product.price === 0;
  const isService = product.product_type === 'service';

  return (
    <div className="tienda-card">
      <div className="tienda-card-image">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} loading="lazy" />
        ) : (
          <div className="libro-cover-placeholder">
            <span>{product.title}</span>
          </div>
        )}
      </div>
      <h3 className="tienda-card-title font-inter">{product.title}</h3>
      <p className="tienda-card-price font-inter">{isFree ? 'Gratis' : formatCOP(product.price)}</p>
      {isService ? (
        <ServiceBookingButton
          title={product.title}
          price={formatCOP(product.price)}
          whatsappText={product.whatsapp_text || `Hola! Quiero reservar ${product.title}`}
          popular={Boolean(product.is_popular)}
          buttonText="Reservar Asesoría"
          calLink={
            product.cal_link ||
            (product.category === 'Alimentación'
              ? 'open-view-consultant-7ng550/alimentacion'
              : 'open-view-consultant-7ng550/30min')
          }
        />
      ) : isFree ? (
        <button
          type="button"
          onClick={() => onDownloadClick(product)}
          className="tienda-card-btn font-inter"
        >
          Descargar gratis
        </button>
      ) : (
        <button type="button" className="tienda-card-btn font-inter" onClick={() => addBook(product)}>
          {inCart ? 'Añadir otro' : 'Añadir al carrito'}
        </button>
      )}
    </div>
  );
}

export default function TiendaClient({ products }: { products: SupabaseProduct[] }) {
  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((p) => p.category))).filter(
      (cat) => !baseCategories.includes(cat as Category)
    );
    return [...baseCategories, ...dynamic];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const visibleStaticProducts = activeCategory === 'Todos'
    ? staticProducts
    : staticProducts.filter((p) => p.category === activeCategory);

  const visibleSupabaseProducts = activeCategory === 'Todos'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const totalCount = staticProducts.length + products.length;

  const [downloadingProduct, setDownloadingProduct] = useState<SupabaseProduct | null>(null);

  return (
    <div className="tienda-main">
      <div className="tienda-back-section">
        <Link href="/" className="tienda-back font-inter">← Volver al inicio</Link>
      </div>

      <div className="tienda-header-sticky">
        <h1 className="tienda-title font-forum">Tienda</h1>
      </div>

      <div className="tienda-subtitle-section">
        <p className="tienda-subtitle font-inter">
          Guías, recetarios, libros, programas y asesorías para acompañarte en cada etapa.
        </p>
      </div>

      <div className="tienda-filters-sticky">
        <div className="tienda-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tienda-category-btn font-inter ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="tienda-container">
        <div className="tienda-grid">
          {visibleSupabaseProducts.map((product) => (
            <SupabaseProductCard
              key={product.id}
              product={product}
              onDownloadClick={(p) => setDownloadingProduct(p)}
            />
          ))}
          {visibleStaticProducts.map((product, idx) => {
            const isSuenoService = product.title.includes('Plan de Sueño') || product.title.includes('Llamada de consulta') || product.title.includes('Programa Recién');
            const isFoodService = product.title.includes('Asesoría en alimentación') || product.title.includes('Curso para el Inicio');
            const targetPage = isSuenoService ? '/sueno' : isFoodService ? '/alimentacion' : null;

            return (
              <div className="tienda-card" key={idx}>
                <div className="tienda-card-image">
                  <img src={product.img} alt={product.title} loading="lazy" />
                </div>
                <h3 className="tienda-card-title font-inter">{product.title}</h3>
                <p className="tienda-card-price font-inter">{product.price}</p>
                {isSuenoService || isFoodService ? (
                  <ServiceBookingButton
                    title={product.title}
                    price={product.price}
                    whatsappText={`Hola! Quiero agendar ${product.title}`}
                    buttonText="Reservar Asesoría"
                    calLink={
                      isFoodService
                        ? 'open-view-consultant-7ng550/alimentacion'
                        : 'open-view-consultant-7ng550/30min'
                    }
                  />
                ) : (
                  <a
                    href={whatsappHref(product.title, product.price)}
                    target="_blank"
                    rel="noreferrer"
                    className="tienda-card-btn font-inter"
                  >
                    Comprar en WhatsApp
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {downloadingProduct && (
        <DownloadModal
          productId={downloadingProduct.id}
          productTitle={downloadingProduct.title}
          onClose={() => setDownloadingProduct(null)}
        />
      )}
    </div>
  );
}
