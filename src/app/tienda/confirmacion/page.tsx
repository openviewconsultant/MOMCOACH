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
    message: "Tu pago fue aprobado. En unos minutos te llegará un correo con el enlace de descarga de tu(s) libro(s).",
    note: "📩 Revisa tu bandeja de entrada (y la carpeta de spam). El enlace de descarga estará activo solo por 48 horas.",
  },
  pending: {
    icon: "⏳",
    variant: "pending",
    title: "Pago pendiente",
    message: "Tu pago está siendo revisado. Apenas se confirme, te enviaremos el enlace de descarga por correo electrónico.",
    note: "📩 Mantente atenta a tu bandeja de entrada: el enlace de descarga será válido por 48 horas desde que lo recibas.",
  },
  in_process: {
    icon: "⏳",
    variant: "pending",
    title: "Pago en proceso",
    message: "Tu pago está siendo revisado. Apenas se confirme, te enviaremos el enlace de descarga por correo electrónico.",
    note: "📩 Mantente atenta a tu bandeja de entrada: el enlace de descarga será válido por 48 horas desde que lo recibas.",
  },
  rejected: {
    icon: "✕",
    variant: "rejected",
    title: "Pago no completado",
    message: "Tu pago no pudo procesarse. Puedes volver a la tienda e intentarlo nuevamente.",
  },
};

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawStatus = params.status ?? params.collection_status;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
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
