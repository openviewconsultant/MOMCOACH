import type { Metadata } from "next";
import Link from "next/link";
import "./confirmacion.css";

export const metadata: Metadata = {
  title: "Confirmación de compra | The Mom Coach",
};

const STATUS_COPY: Record<
  string,
  { icon: string; variant: "approved" | "pending" | "rejected"; title: string; message: string; note?: string }
> = {
  approved: {
    icon: "🎉",
    variant: "approved",
    title: "¡Gracias por tu compra!",
    message: "Tu pago fue aprobado. En unos minutos te llegará un correo con tu compra: si compraste una guía o recetario, incluirá el enlace de descarga; si reservaste una asesoría, la confirmación de tu cita con el enlace de la videollamada.",
    note: "📩 Revisa tu bandeja de entrada (y la carpeta de spam). Los enlaces de descarga estarán activos solo por 48 horas.",
  },
  pending: {
    icon: "⏳",
    variant: "pending",
    title: "Pago pendiente",
    message: "Tu pago está siendo revisado. Apenas se confirme, recibirás el correo con tu compra o la confirmación de tu cita.",
    note: "📩 Mantente atenta a tu bandeja de entrada. Los enlaces de descarga son válidos por 48 horas desde que los recibes.",
  },
  in_process: {
    icon: "⏳",
    variant: "pending",
    title: "Pago en proceso",
    message: "Tu pago está siendo revisado. Apenas se confirme, recibirás el correo con tu compra o la confirmación de tu cita.",
    note: "📩 Mantente atenta a tu bandeja de entrada. Los enlaces de descarga son válidos por 48 horas desde que los recibes.",
  },
  rejected: {
    icon: "✕",
    variant: "rejected",
    title: "Pago no completado",
    message: "Tu pago no pudo procesarse. Puedes volver a la tienda e intentarlo nuevamente.",
  },
};

function firstStr(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawStatus = params.status ?? params.collection_status;
  let status = firstStr(rawStatus);

  // Mercado Pago devuelve al comprador a esta página con el ID de la orden en
  // `external_reference`. Aprovechamos ese regreso para sincronizar el pago
  // contra la API de Mercado Pago aquí mismo — así la cita se agenda y los
  // correos salen al instante, sin depender de que llegue el webhook.
  const externalRef = firstStr(params.external_reference);
  if (externalRef) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const { syncOrderWithMercadoPago } = await import('@/lib/order-sync');
      const result = await syncOrderWithMercadoPago(createAdminClient(), externalRef);
      if (!status && result.status !== 'not_found') status = result.status;
    } catch (error) {
      console.error('No se pudo sincronizar el pago en la página de confirmación', { externalRef, error });
    }
  }

  const copy = (status && STATUS_COPY[status]) || STATUS_COPY.approved;

  return (
    <div className="tienda-main purchase-popup-wrap">
      <div className={`purchase-popup-card`}>
        <div className={`purchase-popup-icon purchase-popup-icon--${copy.variant}`}>{copy.icon}</div>
        <h1 className="purchase-popup-title font-fraunces">{copy.title}</h1>
        <p className="purchase-popup-message font-inter">{copy.message}</p>
        {copy.note && <p className="purchase-popup-note font-inter">{copy.note}</p>}
        <Link href="/tienda" className="purchase-popup-btn font-inter">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
