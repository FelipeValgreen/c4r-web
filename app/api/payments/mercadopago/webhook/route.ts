import { NextRequest, NextResponse } from "next/server";
import { applyMercadoPagoResult, isSellerPublishStoreReady } from "@/lib/seller-publish-store";
import { getMercadoPagoPaymentById, isMercadoPagoReady } from "@/lib/mercadopago";

type MercadoPagoWebhookBody = {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePaymentIdFromBody(payload: MercadoPagoWebhookBody | null): string {
  if (!payload) {
    return "";
  }

  const dataId = payload.data?.id;
  if (typeof dataId === "string" || typeof dataId === "number") {
    return String(dataId);
  }

  return "";
}

function parsePaymentIdFromRequest(request: NextRequest): string {
  const idFromParams = normalizeText(request.nextUrl.searchParams.get("id"));
  if (idFromParams) {
    return idFromParams;
  }

  const dataId = normalizeText(request.nextUrl.searchParams.get("data.id"));
  if (dataId) {
    return dataId;
  }

  return "";
}

export async function GET(request: NextRequest) {
  const paymentId = parsePaymentIdFromRequest(request);
  return NextResponse.json({
    ok: true,
    message: paymentId ? `Webhook recibido para payment ${paymentId}.` : "Webhook endpoint activo.",
  });
}

export async function POST(request: NextRequest) {
  if (!isMercadoPagoReady() || !isSellerPublishStoreReady()) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
  }

  let payload: MercadoPagoWebhookBody | null = null;

  try {
    payload = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    payload = null;
  }

  const paymentId = parsePaymentIdFromRequest(request) || parsePaymentIdFromBody(payload);
  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  try {
    const payment = await getMercadoPagoPaymentById(paymentId);
    await applyMercadoPagoResult(payment);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error procesando webhook.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
