// Traduce los códigos de status_detail que devuelve Mercado Pago a un texto
// legible para mostrar en el panel de administración. Referencia:
// https://www.mercadopago.com.co/developers/es/docs/checkout-api/response-handling/collection-results
const FRIENDLY_DETAIL: Record<string, string> = {
  accredited: 'Acreditado',
  pending_contingency: 'Pago en revisión',
  pending_review_manual: 'Pago en revisión manual',
  cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto',
  cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
  cc_rejected_bad_filled_other: 'Datos de la tarjeta incorrectos',
  cc_rejected_bad_filled_security_code: 'Código de seguridad incorrecto',
  cc_rejected_blacklist: 'Pago rechazado por el banco',
  cc_rejected_call_for_authorize: 'El banco requiere autorización del titular',
  cc_rejected_card_disabled: 'Tarjeta deshabilitada, contactar al banco',
  cc_rejected_duplicated_payment: 'Pago duplicado',
  cc_rejected_high_risk: 'Pago rechazado por riesgo',
  cc_rejected_insufficient_amount: 'Fondos insuficientes',
  cc_rejected_invalid_installments: 'Cuotas no válidas',
  cc_rejected_max_attempts: 'Límite de intentos alcanzado',
  cc_rejected_other_reason: 'Rechazado por el banco',
  cancelled: 'Pago cancelado',
  expired: 'Pago expirado',
  refunded: 'Reembolsado',
  charged_back: 'Contracargo',
};

export function friendlyStatusDetail(statusDetail: string | null): string | null {
  if (!statusDetail) return null;
  const code = statusDetail.split(' — ').pop()?.trim();
  if (code && FRIENDLY_DETAIL[code]) return FRIENDLY_DETAIL[code];
  return statusDetail;
}
