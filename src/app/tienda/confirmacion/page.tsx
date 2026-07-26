import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirmación de compra | The Mom Coach",
};

const STATUS_COPY: Record<string, { title: string; message: string }> = {
  approved: {
    title: "¡Pago aprobado!",
    message: "En unos minutos recibirás un correo con el enlace de descarga de tu(s) libro(s).",
  },
  pending: {
    title: "Pago pendiente",
    message: "Tu pago está siendo revisado. Te enviaremos el enlace de descarga por correo apenas se confirme.",
  },
  in_process: {
    title: "Pago en proceso",
    message: "Tu pago está siendo revisado. Te enviaremos el enlace de descarga por correo apenas se confirme.",
  },
  rejected: {
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
  const copy = (status && STATUS_COPY[status]) || {
    title: "Gracias por tu compra",
    message: "Si tu pago fue aprobado, recibirás un correo con el enlace de descarga en unos minutos.",
  };

  return (
    <div className="tienda-main">
      <div className="tienda-container" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <h1 className="tienda-title font-forum">{copy.title}</h1>
        <p className="tienda-subtitle font-inter" style={{ margin: "0 auto 32px" }}>
          {copy.message}
        </p>
        <Link href="/tienda" className="tienda-card-btn font-inter" style={{ display: "inline-block" }}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
