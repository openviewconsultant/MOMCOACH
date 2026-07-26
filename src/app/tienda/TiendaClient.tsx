'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './tienda.css';
import { CartProvider, useCart } from '@/lib/cart-context';
import { books } from '@/lib/books';
import CartDrawer from '@/components/tienda/CartDrawer';
import { formatCOP } from '@/lib/format';

type Category = 'Todos' | 'Sueño infantil' | 'Alimentación' | 'Gratuitos' | 'Tarjeta de regalo' | 'Libros';

interface Product {
  title: string;
  price: string;
  img: string;
  category: Exclude<Category, 'Todos'>;
}

const products: Product[] = [
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

const categories: Category[] = ['Todos', 'Libros', 'Sueño infantil', 'Alimentación', 'Gratuitos', 'Tarjeta de regalo'];

const WHATSAPP_NUMBER = '573102158656';

function whatsappHref(title: string, price: string) {
  const text = `Hola! Me interesa: ${title} (${price})`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function BookCard({ book }: { book: (typeof books)[number] }) {
  const { addBook, items } = useCart();
  const inCart = items.some((item) => item.id === book.id);

  return (
    <div className="tienda-card">
      <div className="tienda-card-image">
        {book.img ? (
          <img src={book.img} alt={book.title} loading="lazy" />
        ) : (
          <div className="libro-cover-placeholder">
            <span>{book.title}</span>
          </div>
        )}
      </div>
      <h3 className="tienda-card-title font-inter">{book.title}</h3>
      <p className="tienda-card-price font-inter">{formatCOP(book.price)}</p>
      <button
        type="button"
        className="tienda-card-btn font-inter"
        onClick={() => addBook(book)}
      >
        {inCart ? 'Añadir otro' : 'Añadir al carrito'}
      </button>
    </div>
  );
}

function TiendaContent() {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');

  const visibleProducts = activeCategory === 'Todos'
    ? products
    : activeCategory === 'Libros'
      ? []
      : products.filter((p) => p.category === activeCategory);

  const visibleBooks = activeCategory === 'Todos' || activeCategory === 'Libros' ? books : [];

  const totalCount = products.length + books.length;

  return (
    <div className="tienda-main">
      <div className="tienda-container">
        <Link href="/" className="tienda-back font-inter">← Volver al inicio</Link>

        <h1 className="tienda-title font-forum">Tienda</h1>
        <p className="tienda-subtitle font-inter">
          Guías, recetarios, libros, programas y asesorías para acompañarte en cada etapa. Mostrando los {totalCount} productos.
        </p>

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

        <div className="tienda-grid">
          {visibleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
          {visibleProducts.map((product, idx) => (
            <div className="tienda-card" key={idx}>
              <div className="tienda-card-image">
                <img src={product.img} alt={product.title} loading="lazy" />
              </div>
              <h3 className="tienda-card-title font-inter">{product.title}</h3>
              <p className="tienda-card-price font-inter">{product.price}</p>
              <a
                href={whatsappHref(product.title, product.price)}
                target="_blank"
                rel="noreferrer"
                className="tienda-card-btn font-inter"
              >
                Comprar en WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}

export default function TiendaClient() {
  return (
    <CartProvider>
      <TiendaContent />
    </CartProvider>
  );
}
