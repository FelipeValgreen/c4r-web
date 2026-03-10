import "server-only";

import { siteUrl } from "@/lib/site";

const MERCADOPAGO_ACCESS_TOKEN = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").trim();
const MERCADOPAGO_API_URL = (process.env.MERCADOPAGO_API_URL ?? "https://api.mercadopago.com").trim();
const PUBLICATION_FEE_CLP = Math.max(1000, Number(process.env.C4R_PUBLICATION_FEE_CLP ?? "19990") || 19990);

export type MercadoPagoPaymentSnapshot = {
  id: string;
  status: string;
  statusDetail: string;
  externalReference: string;
  preferenceId: string;
  payerEmail: string | null;
};

type MercadoPagoPreferenceInput = {
  title: string;
  amountClp: number;
  payerEmail: string;
  externalReference: string;
  listingId: string;
};

type MercadoPagoPreferenceResult = {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
};

type MercadoPagoPaymentResponse = {
  id: number | string;
  status?: string | null;
  status_detail?: string | null;
  external_reference?: string | null;
  order?: {
    id?: string | null;
  } | null;
  metadata?: {
    listing_id?: string | null;
  } | null;
  additional_info?: {
    items?: Array<{
      id?: string | null;
    }>;
  } | null;
  payer?: {
    email?: string | null;
  } | null;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function mercadopagoRequest<T>(path: string, init: RequestInit): Promise<T> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("Mercado Pago no configurado. Define MERCADOPAGO_ACCESS_TOKEN.");
  }

  const response = await fetch(`${MERCADOPAGO_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mercado Pago error (${response.status}): ${details}`);
  }

  return (await response.json()) as T;
}

export function isMercadoPagoReady(): boolean {
  return MERCADOPAGO_ACCESS_TOKEN.length > 0;
}

export function getPublicationFeeClp(): number {
  return PUBLICATION_FEE_CLP;
}

export async function createPublicationPreference(
  input: MercadoPagoPreferenceInput,
): Promise<MercadoPagoPreferenceResult> {
  const successUrl = `${siteUrl}/publicar-auto?payment=success&listing=${encodeURIComponent(input.listingId)}&ref=${encodeURIComponent(input.externalReference)}`;
  const pendingUrl = `${siteUrl}/publicar-auto?payment=pending&listing=${encodeURIComponent(input.listingId)}&ref=${encodeURIComponent(input.externalReference)}`;
  const failureUrl = `${siteUrl}/publicar-auto?payment=failure&listing=${encodeURIComponent(input.listingId)}&ref=${encodeURIComponent(input.externalReference)}`;

  const body = {
    external_reference: input.externalReference,
    payer: {
      email: input.payerEmail,
    },
    items: [
      {
        id: input.listingId,
        title: input.title,
        quantity: 1,
        currency_id: "CLP",
        unit_price: input.amountClp,
      },
    ],
    metadata: {
      listing_id: input.listingId,
      flow: "c4r_publicar_auto",
    },
    notification_url: `${siteUrl}/api/payments/mercadopago/webhook`,
    back_urls: {
      success: successUrl,
      pending: pendingUrl,
      failure: failureUrl,
    },
    auto_return: "approved",
  };

  const response = await mercadopagoRequest<{
    id: string;
    init_point?: string | null;
    sandbox_init_point?: string | null;
  }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const preferenceId = normalizeText(response.id);
  const initPoint = normalizeText(response.init_point);
  const sandboxInitPoint = normalizeText(response.sandbox_init_point);

  if (!preferenceId || (!initPoint && !sandboxInitPoint)) {
    throw new Error("Mercado Pago no devolvió un checkout válido.");
  }

  return {
    preferenceId,
    initPoint: initPoint || sandboxInitPoint,
    sandboxInitPoint,
  };
}

function mapMercadoPagoPayment(payload: MercadoPagoPaymentResponse): MercadoPagoPaymentSnapshot {
  const externalReference = normalizeText(payload.external_reference);
  const fallbackPreferenceId = normalizeText(payload.order?.id);
  const itemPreferenceId = normalizeText(payload.additional_info?.items?.[0]?.id);

  return {
    id: String(payload.id),
    status: normalizeText(payload.status) || "pending",
    statusDetail: normalizeText(payload.status_detail) || "pending",
    externalReference,
    preferenceId: fallbackPreferenceId || itemPreferenceId,
    payerEmail: normalizeText(payload.payer?.email) || null,
  };
}

export async function getMercadoPagoPaymentById(paymentId: string): Promise<MercadoPagoPaymentSnapshot> {
  const normalizedId = normalizeText(paymentId);
  if (!normalizedId) {
    throw new Error("paymentId inválido.");
  }

  const response = await mercadopagoRequest<MercadoPagoPaymentResponse>(`/v1/payments/${encodeURIComponent(normalizedId)}`, {
    method: "GET",
  });

  return mapMercadoPagoPayment(response);
}

export async function findMercadoPagoPaymentByExternalReference(
  externalReference: string,
): Promise<MercadoPagoPaymentSnapshot | null> {
  const normalizedReference = normalizeText(externalReference);
  if (!normalizedReference) {
    return null;
  }

  const response = await mercadopagoRequest<{
    results?: MercadoPagoPaymentResponse[];
  }>(
    `/v1/payments/search?sort=date_created&criteria=desc&limit=1&external_reference=${encodeURIComponent(normalizedReference)}`,
    {
      method: "GET",
    },
  );

  const payment = response.results?.[0];
  if (!payment) {
    return null;
  }

  return mapMercadoPagoPayment(payment);
}
