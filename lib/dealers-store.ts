import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  BlobNotFoundError,
  del as delBlob,
  get as getBlob,
  head as headBlob,
  list as listBlob,
  put as putBlob,
} from "@vercel/blob";
import {
  dealerContracts as seedContracts,
  dealerCustomers as seedCustomers,
  dealerLeads as seedLeads,
  dealerPayments as seedPayments,
  dealerSalesChannels,
  dealerTasks as seedTasks,
  dealerVehicles as seedVehicles,
  financingRequests as seedFinancing,
  type DealerContract,
  type DealerCustomer,
  type DealerLead,
  type DealerVehicleChannels,
  type DealerPayment,
  type DealerTask,
  type DealerVehicle,
  type FinancingDocument,
  type FinancingDocumentStatus,
  type FinancingOffer,
  type FinancingProductType,
  type FinancingRequest,
  type FinancingStatus,
  type LeadStage,
  type SalesChannel,
  type VehicleStatus,
} from "@/app/dealers/_data";

const STORE_VERSION = 1;
const STORE_BLOB_PATH = normalizeText(process.env.DEALERS_STORE_BLOB_PATH) || "dealers/dealers-store.json";
const STORE_BLOB_PREFIX =
  normalizeText(process.env.DEALERS_STORE_BLOB_PREFIX) || "dealers/dealers-store-";
const STORE_BLOB_TOKEN = normalizeText(process.env.BLOB_READ_WRITE_TOKEN);
const STORE_BLOB_ACCESS =
  normalizeText(process.env.DEALERS_STORE_BLOB_ACCESS).toLowerCase() === "private" ? "private" : "public";
const STORE_FILE =
  normalizeText(process.env.DEALERS_STORE_FILE) ||
  (process.env.VERCEL
    ? path.join("/tmp", "c4r", "dealers-store.json")
    : path.join(process.cwd(), "data", "dealers-store.json"));
const USE_BLOB_STORE = STORE_BLOB_TOKEN.length > 0;
const DEFAULT_PORTAL_USERNAME =
  normalizeText(process.env.DEALERS_DEMO_PORTAL_USER) || "demo@dealer.c4r.cl";
const DEFAULT_PORTAL_PASSWORD =
  normalizeText(process.env.DEALERS_DEMO_PORTAL_PASSWORD) || "C4RDealerDemo2026!";

export const DEFAULT_DEALER_ID = "DLR-C4R-DEMO";

export type DealerRegistrationStatus = "pendiente" | "activo" | "rechazado";

export type DealerRegistration = {
  id: string;
  companyName: string;
  companyRut: string;
  email: string;
  phone: string;
  address: string;
  portalUsername: string;
  portalPasswordHash: string;
  status: DealerRegistrationStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type DealerRegistrationPublic = Omit<DealerRegistration, "portalPasswordHash">;

export type DealerStoreVehicle = DealerVehicle & {
  dealerId: string;
  updatedAt: string;
};

export type DealerVehicleChannelStatus = "publicado" | "pendiente" | "pausado" | "error";

export type DealerVehicleChannelState = {
  channel: SalesChannel;
  enabled: boolean;
  status: DealerVehicleChannelStatus;
  message: string;
};

export type DealerNetworkSnapshot = {
  registrations: DealerRegistrationPublic[];
  vehicles: DealerStoreVehicle[];
};

export type DealerChannelSnapshotItem = {
  vehicle: DealerStoreVehicle;
  channels: DealerVehicleChannelState[];
};

export type DealerStoreLead = DealerLead & {
  dealerId: string;
  email: string | null;
  source: "manual" | "reserva" | "compra";
  updatedAt: string;
};

export type DealerStoreCustomer = DealerCustomer & {
  dealerId: string;
  updatedAt: string;
};

export type DealerStoreTask = DealerTask & {
  dealerId: string;
  createdAt: string;
  updatedAt: string;
};

export type DealerStoreFinancingRequest = FinancingRequest & {
  dealerId: string;
  updatedAt: string;
};

export type DealerStorePayment = DealerPayment & {
  dealerId: string;
  updatedAt: string;
};

export type DealerStoreContract = DealerContract & {
  dealerId: string;
  updatedAt: string;
};

export type DealerStoreState = {
  version: number;
  registrations: DealerRegistration[];
  vehicles: DealerStoreVehicle[];
  leads: DealerStoreLead[];
  customers: DealerStoreCustomer[];
  tasks: DealerStoreTask[];
  financingRequests: DealerStoreFinancingRequest[];
  payments: DealerStorePayment[];
  contracts: DealerStoreContract[];
};

export type DealerSnapshot = {
  registrations: DealerRegistrationPublic[];
  vehicles: DealerStoreVehicle[];
  leads: DealerStoreLead[];
  customers: DealerStoreCustomer[];
  tasks: DealerStoreTask[];
  financingRequests: DealerStoreFinancingRequest[];
  payments: DealerStorePayment[];
  contracts: DealerStoreContract[];
};

type RegisterDealerInput = {
  companyName: string;
  companyRut: string;
  email: string;
  phone: string;
  address: string;
  portalUsername: string;
  portalPassword: string;
};

type CreateDealerVehicleInput = {
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  image?: string;
  gallery?: string[];
  bodyStyle?: string;
  fuelType?: string;
  transmission?: string;
  location?: string;
  description?: string;
  channels?: Partial<DealerVehicleChannels>;
  status?: VehicleStatus;
};

type WebLeadInput = {
  vehicleId: string;
  vehicleTitle: string;
  fullName: string;
  email: string;
  phone: string;
  dealerId?: string;
  source: "reserva" | "compra";
};

type CreateFinancingRequestInput = {
  customer: string;
  vehicle: string;
  amount: number;
  rut?: string;
  email?: string;
  phone?: string;
  monthlyIncome?: number;
  downPayment?: number;
  termMonths?: number;
  productType?: FinancingProductType;
  assignedExecutive?: string;
};

let writeLock: Promise<void> = Promise.resolve();
let mutationLock: Promise<void> = Promise.resolve();

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isStoreState(value: unknown): value is DealerStoreState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DealerStoreState>;

  return (
    candidate.version === STORE_VERSION &&
    Array.isArray(candidate.registrations) &&
    Array.isArray(candidate.vehicles) &&
    Array.isArray(candidate.leads) &&
    Array.isArray(candidate.customers) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.financingRequests) &&
    Array.isArray(candidate.payments) &&
    Array.isArray(candidate.contracts)
  );
}

function toIsoNow(): string {
  return new Date().toISOString();
}

function toYmdNow(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRut(value: string): string {
  return value.replace(/[^0-9Kk.-]/g, "").toUpperCase();
}

function normalizePortalUsername(value: string): string {
  return normalizeText(value).toLowerCase();
}

function hashPortalPassword(value: string): string {
  return createHash("sha256").update(normalizeText(value)).digest("hex");
}

function verifyPortalPassword(password: string, expectedHash: string): boolean {
  const incomingHash = hashPortalPassword(password);
  return incomingHash === expectedHash;
}

function defaultVehicleChannels(): DealerVehicleChannels {
  return {
    c4r: true,
    chileautos: true,
    mercadolibre: true,
    facebook: true,
    yapo: true,
  };
}

function normalizeVehicleChannels(input?: Partial<DealerVehicleChannels> | null): DealerVehicleChannels {
  const defaults = defaultVehicleChannels();
  if (!input || typeof input !== "object") {
    return defaults;
  }

  return {
    c4r: typeof input.c4r === "boolean" ? input.c4r : defaults.c4r,
    chileautos: typeof input.chileautos === "boolean" ? input.chileautos : defaults.chileautos,
    mercadolibre: typeof input.mercadolibre === "boolean" ? input.mercadolibre : defaults.mercadolibre,
    facebook: typeof input.facebook === "boolean" ? input.facebook : defaults.facebook,
    yapo: typeof input.yapo === "boolean" ? input.yapo : defaults.yapo,
  };
}

function normalizeImageUrl(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "/car-placeholder.svg";
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return "/car-placeholder.svg";
}

function hasValidImage(url: string): boolean {
  const value = normalizeText(url).toLowerCase();
  if (!value) {
    return false;
  }

  if (value.includes("noimage") || value.includes("placeholder")) {
    return false;
  }

  return value.startsWith("/") || /^https?:\/\//.test(value);
}

function normalizeVehicleStatus(value: string): VehicleStatus {
  if (value === "reservado" || value === "vendido") {
    return value;
  }

  return "disponible";
}

function normalizeLeadStage(value: string): LeadStage {
  if (value === "contactado" || value === "oferta" || value === "cerrado") {
    return value;
  }

  return "nuevo";
}

function normalizeFinancingStatus(value: string): FinancingStatus {
  if (
    value === "borrador" ||
    value === "enviada" ||
    value === "evaluando" ||
    value === "ofertas" ||
    value === "aprobada" ||
    value === "rechazada"
  ) {
    return value;
  }

  return "borrador";
}

function normalizeFinancingDocumentStatus(value: string): FinancingDocumentStatus {
  if (value === "cargado" || value === "validado") {
    return value;
  }

  return "pendiente";
}

function normalizeFinancingProductType(value: string): FinancingProductType {
  if (value === "inteligente" || value === "leasing") {
    return value;
  }

  return "convencional";
}

function defaultFinancingDocuments(): FinancingDocument[] {
  return [
    { id: "doc-id", label: "Cedula de identidad", status: "pendiente" },
    { id: "doc-income", label: "Liquidaciones y cotizaciones", status: "pendiente" },
    { id: "doc-address", label: "Comprobante de domicilio", status: "pendiente" },
    { id: "doc-credit", label: "Pre-evaluacion crediticia", status: "pendiente" },
  ];
}

function calculatePaperworkScore(documents: FinancingDocument[]): number {
  if (documents.length === 0) {
    return 0;
  }

  const weights = {
    pendiente: 0,
    cargado: 0.6,
    validado: 1,
  } as const;

  const completed = documents.reduce((sum, doc) => sum + weights[doc.status], 0);
  return Math.round((completed / documents.length) * 100);
}

function createFinancingOffers(requestId: string, amount: number, termMonths: number, downPayment: number): FinancingOffer[] {
  const lenders = ["Banco Andino", "Banco Pacifico", "CrediMovil"];
  const financedAmount = Math.max(500000, amount - downPayment);
  const baseRate = amount <= 15000000 ? 10.8 : 11.9;

  return lenders.map((lender, index) => {
    const annualRate = Number((baseRate + index * 0.9).toFixed(1));
    const factor = 1 + annualRate / 100 * (termMonths / 12);
    const monthlyFee = Math.round((financedAmount * factor) / termMonths);
    const approvedAmount = Math.round(financedAmount * (index === 2 ? 0.95 : 1));

    return {
      id: `${requestId}-off-${index + 1}`,
      lender,
      approvedAmount,
      termMonths,
      annualRate,
      monthlyFee,
      status: index === 0 ? "aprobada" : "preaprobada",
    };
  });
}

function ensureFinancingRequestShape(request: DealerStoreFinancingRequest): DealerStoreFinancingRequest {
  const normalizedDocs = (request.documents ?? defaultFinancingDocuments()).map((document, index) => ({
    id: normalizeText(document.id) || `doc-${index + 1}`,
    label: normalizeText(document.label) || "Documento",
    status: normalizeFinancingDocumentStatus(document.status),
  }));

  const normalizedOffers = (request.offers ?? []).map((offer, index) => {
    const normalizedStatus: FinancingOffer["status"] =
      offer.status === "rechazada" ? "rechazada" : offer.status === "aprobada" ? "aprobada" : "preaprobada";

    return {
      id: normalizeText(offer.id) || `offer-${index + 1}`,
      lender: normalizeText(offer.lender) || "Financiera",
      approvedAmount: Math.max(0, Number(offer.approvedAmount) || 0),
      termMonths: Math.max(12, Number(offer.termMonths) || 36),
      annualRate: Math.max(0, Number(offer.annualRate) || 0),
      monthlyFee: Math.max(0, Number(offer.monthlyFee) || 0),
      status: normalizedStatus,
    };
  });

  const normalizedTerm = Math.max(12, Number(request.termMonths) || 36);
  const normalizedDownPayment = Math.max(0, Number(request.downPayment) || 0);
  const normalizedIncome = Math.max(0, Number(request.monthlyIncome) || 0);
  const normalizedAmount = Math.max(1, Number(request.amount) || 1);
  const selectedOfferId = normalizeText(request.selectedOfferId ?? "") || null;

  return {
    ...request,
    amount: normalizedAmount,
    status: normalizeFinancingStatus(request.status),
    rut: normalizeText(request.rut ?? ""),
    email: normalizeText(request.email ?? ""),
    phone: normalizeText(request.phone ?? ""),
    monthlyIncome: normalizedIncome,
    downPayment: normalizedDownPayment,
    termMonths: normalizedTerm,
    productType: normalizeFinancingProductType(request.productType ?? "convencional"),
    assignedExecutive: normalizeText(request.assignedExecutive ?? "") || "Equipo Credito C4R",
    paperworkScore: calculatePaperworkScore(normalizedDocs),
    selectedOfferId,
    documents: normalizedDocs,
    offers: normalizedOffers,
  };
}

function createId(prefix: string): string {
  const now = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${now}${random}`;
}

function byMostRecentDate<T extends { createdAt: string }>(left: T, right: T): number {
  return right.createdAt.localeCompare(left.createdAt);
}

function byNewestVehicle(left: DealerStoreVehicle, right: DealerStoreVehicle): number {
  if (right.year !== left.year) {
    return right.year - left.year;
  }

  if (left.price !== right.price) {
    return left.price - right.price;
  }

  return `${left.brand} ${left.model}`.localeCompare(`${right.brand} ${right.model}`, "es");
}

function channelMessage(channel: SalesChannel, status: DealerVehicleChannelStatus): string {
  if (status === "pausado") {
    return "Publicacion pausada";
  }

  if (status === "error") {
    return "Falta imagen valida para sincronizar";
  }

  if (status === "pendiente") {
    return "En cola de publicacion";
  }

  if (channel === "c4r") {
    return "Publicado en C4R";
  }

  return "Publicado y sincronizado";
}

function computeChannelStatus(
  vehicle: DealerStoreVehicle,
  channel: SalesChannel,
  enabled: boolean,
): DealerVehicleChannelStatus {
  if (!enabled) {
    return "pausado";
  }

  if (vehicle.status === "vendido") {
    return "pausado";
  }

  if (!hasValidImage(vehicle.image)) {
    return "error";
  }

  if (channel === "c4r") {
    return "publicado";
  }

  if (vehicle.status === "reservado") {
    return "pendiente";
  }

  return "publicado";
}

function resolveVehicleChannelStates(vehicle: DealerStoreVehicle): DealerVehicleChannelState[] {
  const channels = normalizeVehicleChannels(vehicle.channels);

  return dealerSalesChannels.map(({ key }) => {
    const enabled = channels[key];
    const status = computeChannelStatus(vehicle, key, enabled);
    return {
      channel: key,
      enabled,
      status,
      message: channelMessage(key, status),
    };
  });
}

function normalizeRegistrationPortalAccess(registration: DealerRegistration): DealerRegistration {
  const normalizedPortalUsername = normalizePortalUsername(registration.portalUsername || registration.email);
  const normalizedPortalPasswordHash = normalizeText(registration.portalPasswordHash);

  return {
    ...registration,
    email: normalizeText(registration.email).toLowerCase(),
    portalUsername: normalizedPortalUsername,
    portalPasswordHash: normalizedPortalPasswordHash || hashPortalPassword(DEFAULT_PORTAL_PASSWORD),
  };
}

function toPublicRegistration(registration: DealerRegistration): DealerRegistrationPublic {
  const normalized = normalizeRegistrationPortalAccess(registration);
  const publicRegistration = {
    ...normalized,
  };
  delete (publicRegistration as { portalPasswordHash?: string }).portalPasswordHash;
  return publicRegistration;
}

function createInitialStoreState(): DealerStoreState {
  const now = toIsoNow();

  return {
    version: STORE_VERSION,
    registrations: [
      {
        id: DEFAULT_DEALER_ID,
        companyName: "C4R Dealers Demo",
        companyRut: "76.111.111-1",
        email: "dealers@c4r.cl",
        phone: "+56 9 1111 1111",
        address: "Av. Apoquindo 3000, Las Condes",
        portalUsername: DEFAULT_PORTAL_USERNAME,
        portalPasswordHash: hashPortalPassword(DEFAULT_PORTAL_PASSWORD),
        status: "activo",
        createdAt: now,
        reviewedAt: now,
      },
    ],
    vehicles: seedVehicles.map((vehicle) => ({
      ...vehicle,
      image: normalizeImageUrl(vehicle.image),
      gallery: Array.isArray(vehicle.gallery)
        ? vehicle.gallery.map((image) => normalizeImageUrl(image)).filter(Boolean)
        : [normalizeImageUrl(vehicle.image)],
      channels: normalizeVehicleChannels(vehicle.channels),
      dealerId: DEFAULT_DEALER_ID,
      updatedAt: now,
    })),
    leads: seedLeads.map((lead) => ({
      ...lead,
      dealerId: DEFAULT_DEALER_ID,
      email: null,
      source: "manual",
      updatedAt: now,
    })),
    customers: seedCustomers.map((customer) => ({
      ...customer,
      dealerId: DEFAULT_DEALER_ID,
      updatedAt: now,
    })),
    tasks: seedTasks.map((task) => ({
      ...task,
      dealerId: DEFAULT_DEALER_ID,
      createdAt: now,
      updatedAt: now,
    })),
    financingRequests: seedFinancing.map((request) =>
      ensureFinancingRequestShape({
        ...request,
        dealerId: DEFAULT_DEALER_ID,
        updatedAt: now,
      }),
    ),
    payments: seedPayments.map((payment) => ({
      ...payment,
      dealerId: DEFAULT_DEALER_ID,
      updatedAt: now,
    })),
    contracts: seedContracts.map((contract) => ({
      ...contract,
      dealerId: DEFAULT_DEALER_ID,
      updatedAt: now,
    })),
  };
}

function normalizeStoreState(state: DealerStoreState): DealerStoreState {
  state.registrations = state.registrations.map((registration) =>
    normalizeRegistrationPortalAccess(registration),
  );

  state.vehicles = state.vehicles.map((vehicle) => ({
    ...vehicle,
    image: normalizeImageUrl(vehicle.image),
    gallery: Array.isArray(vehicle.gallery)
      ? vehicle.gallery.map((image) => normalizeImageUrl(image)).filter(Boolean)
      : [normalizeImageUrl(vehicle.image)],
    channels: normalizeVehicleChannels(vehicle.channels),
  }));

  return state;
}

async function ensureStore(): Promise<DealerStoreState> {
  if (USE_BLOB_STORE) {
    const blobState = await readStoreFromBlob();
    if (blobState) {
      const normalized = normalizeStoreState(blobState);
      return cloneState(normalized);
    }

    const initial = normalizeStoreState(createInitialStoreState());
    await persistStore(initial);
    return cloneState(initial);
  }

  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoreState(parsed)) {
      throw new Error("Unsupported store version");
    }
    const normalized = normalizeStoreState(parsed);
    return cloneState(normalized);
  } catch {
    const initial = normalizeStoreState(createInitialStoreState());
    await persistStore(initial);
    return cloneState(initial);
  }
}

async function readStoreFromBlob(): Promise<DealerStoreState | null> {
  try {
    let blobUrl: string | null = null;
    const history = await listBlob({ prefix: STORE_BLOB_PREFIX, token: STORE_BLOB_TOKEN, limit: 100 });

    if (history.blobs.length > 0) {
      const latest = history.blobs
        .slice()
        .sort((left, right) => right.uploadedAt.getTime() - left.uploadedAt.getTime())[0];
      blobUrl = latest?.url ?? null;
    } else {
      try {
        const legacyBlob = await headBlob(STORE_BLOB_PATH, {
          token: STORE_BLOB_TOKEN,
        });
        blobUrl = legacyBlob.url;
      } catch (error) {
        if (error instanceof BlobNotFoundError) {
          return null;
        }
        throw error;
      }
    }

    if (!blobUrl) {
      return null;
    }

    const getOptions =
      STORE_BLOB_ACCESS === "private"
        ? { access: "private" as const, useCache: false, token: STORE_BLOB_TOKEN }
        : { access: "public" as const, token: STORE_BLOB_TOKEN };

    const blob = await getBlob(blobUrl, getOptions);

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return null;
    }

    const raw = await new Response(blob.stream).text();
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoreState(parsed)) {
      return null;
    }

    return cloneState(parsed);
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return null;
    }
    throw error;
  }
}

async function persistStore(nextState: DealerStoreState): Promise<void> {
  const currentWrite = writeLock.catch(() => undefined).then(async () => {
    if (USE_BLOB_STORE) {
      await putBlob(`${STORE_BLOB_PREFIX}${Date.now()}.json`, JSON.stringify(nextState, null, 2), {
        access: STORE_BLOB_ACCESS,
        addRandomSuffix: true,
        contentType: "application/json",
        token: STORE_BLOB_TOKEN,
        cacheControlMaxAge: 60,
      });

      try {
        const history = await listBlob({ prefix: STORE_BLOB_PREFIX, token: STORE_BLOB_TOKEN, limit: 100 });
        if (history.blobs.length > 20) {
          const stale = history.blobs
            .slice()
            .sort((left, right) => left.uploadedAt.getTime() - right.uploadedAt.getTime())
            .slice(0, history.blobs.length - 20)
            .map((blob) => blob.pathname);

          if (stale.length > 0) {
            await delBlob(stale, { token: STORE_BLOB_TOKEN });
          }
        }
      } catch {
        // keep flow resilient if cleanup fails
      }

      return;
    }

    await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(nextState, null, 2), "utf8");
  });

  writeLock = currentWrite;
  await currentWrite;
}

async function mutateStore(
  updater: (state: DealerStoreState) => DealerStoreState,
): Promise<DealerStoreState> {
  let nextSnapshot: DealerStoreState | null = null;

  const currentMutation = mutationLock.catch(() => undefined).then(async () => {
    const current = await ensureStore();
    const next = updater(cloneState(current));
    await persistStore(next);
    nextSnapshot = cloneState(next);
  });

  mutationLock = currentMutation.catch(() => undefined);
  await currentMutation;

  if (!nextSnapshot) {
    throw new Error("No fue posible persistir cambios de dealer.");
  }

  return nextSnapshot;
}

function ensureCustomerFromLead(state: DealerStoreState, lead: DealerStoreLead): void {
  const email = normalizeText(lead.email ?? "").toLowerCase();
  const phone = normalizeText(lead.phone);

  const existing = state.customers.find(
    (customer) =>
      customer.dealerId === lead.dealerId &&
      (normalizeText(customer.phone) === phone || normalizeText(customer.email).toLowerCase() === email),
  );

  if (existing) {
    existing.name = lead.customer;
    if (email) {
      existing.email = email;
    }
    if (phone) {
      existing.phone = phone;
    }
    existing.updatedAt = toIsoNow();
    return;
  }

  state.customers.unshift({
    id: createId("cus"),
    dealerId: lead.dealerId,
    name: lead.customer,
    email: email || "sin-email@c4r.cl",
    phone: phone || "Sin telefono",
    city: "Santiago",
    purchases: 0,
    updatedAt: toIsoNow(),
  });
}

export async function getDealerSnapshot(dealerId: string = DEFAULT_DEALER_ID): Promise<DealerSnapshot> {
  const state = await ensureStore();

  return {
    registrations: state.registrations
      .slice()
      .sort(byMostRecentDate)
      .map((registration) => toPublicRegistration(registration)),
    vehicles: state.vehicles
      .filter((vehicle) => vehicle.dealerId === dealerId)
      .slice()
      .sort(byNewestVehicle),
    leads: state.leads
      .filter((lead) => lead.dealerId === dealerId)
      .slice()
      .sort(byMostRecentDate),
    customers: state.customers
      .filter((customer) => customer.dealerId === dealerId)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name, "es")),
    tasks: state.tasks
      .filter((task) => task.dealerId === dealerId)
      .slice()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    financingRequests: state.financingRequests
      .filter((request) => request.dealerId === dealerId)
      .map((request) => ensureFinancingRequestShape(request))
      .slice()
      .sort(byMostRecentDate),
    payments: state.payments
      .filter((payment) => payment.dealerId === dealerId)
      .slice()
      .sort((left, right) => right.date.localeCompare(left.date)),
    contracts: state.contracts
      .filter((contract) => contract.dealerId === dealerId)
      .slice()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  };
}

export async function getDealerNetworkSnapshot(): Promise<DealerNetworkSnapshot> {
  const state = await ensureStore();

  return {
    registrations: state.registrations.slice().sort(byMostRecentDate).map((registration) => toPublicRegistration(registration)),
    vehicles: state.vehicles.slice().sort(byNewestVehicle),
  };
}

export async function getDealerChannelSnapshot(
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerChannelSnapshotItem[]> {
  const state = await ensureStore();

  return state.vehicles
    .filter((vehicle) => vehicle.dealerId === dealerId)
    .slice()
    .sort(byNewestVehicle)
    .map((vehicle) => ({
      vehicle: { ...vehicle, channels: normalizeVehicleChannels(vehicle.channels) },
      channels: resolveVehicleChannelStates(vehicle),
    }));
}

export async function registerDealer(input: RegisterDealerInput): Promise<DealerRegistration> {
  const companyName = normalizeText(input.companyName);
  const companyRut = normalizeRut(normalizeText(input.companyRut));
  const email = normalizeText(input.email).toLowerCase();
  const phone = normalizeText(input.phone);
  const address = normalizeText(input.address);
  const portalUsername = normalizePortalUsername(input.portalUsername || email);
  const portalPassword = normalizeText(input.portalPassword);
  if (!portalUsername || !portalPassword) {
    throw new Error("Credenciales de acceso incompletas.");
  }
  const portalPasswordHash = hashPortalPassword(portalPassword);

  const nextState = await mutateStore((state) => {
    const rutExists = state.registrations.some((registration) => registration.companyRut === companyRut);
    if (rutExists) {
      throw new Error("Ya existe una solicitud con ese RUT.");
    }

    const emailExists = state.registrations.some((registration) => registration.email.toLowerCase() === email);
    if (emailExists) {
      throw new Error("Ya existe una solicitud con ese correo.");
    }

    const userExists = state.registrations.some(
      (registration) => normalizePortalUsername(registration.portalUsername) === portalUsername,
    );
    if (userExists) {
      throw new Error("El usuario de acceso ya esta registrado.");
    }

    const registration: DealerRegistration = {
      id: createId("DLR"),
      companyName,
      companyRut,
      email,
      phone,
      address,
      portalUsername,
      portalPasswordHash,
      status: "activo",
      createdAt: toIsoNow(),
      reviewedAt: toIsoNow(),
    };

    state.registrations.unshift(registration);
    return state;
  });

  return nextState.registrations[0];
}

export async function updateDealerRegistrationStatus(
  registrationId: string,
  status: DealerRegistrationStatus,
): Promise<DealerRegistration | null> {
  const nextState = await mutateStore((state) => {
    const registration = state.registrations.find((entry) => entry.id === registrationId);
    if (!registration) {
      return state;
    }

    registration.status = status;
    registration.reviewedAt = toIsoNow();

    return state;
  });

  return nextState.registrations.find((registration) => registration.id === registrationId) ?? null;
}

export async function authenticateDealerPortalCredentials(
  username: string,
  password: string,
): Promise<DealerRegistration | null> {
  const normalizedUser = normalizePortalUsername(username);
  const normalizedPassword = normalizeText(password);
  if (!normalizedUser || !normalizedPassword) {
    return null;
  }

  const state = await ensureStore();
  const registration = state.registrations.find(
    (entry) =>
      entry.status === "activo" && normalizePortalUsername(entry.portalUsername) === normalizedUser,
  );

  if (!registration) {
    return null;
  }

  if (!verifyPortalPassword(normalizedPassword, registration.portalPasswordHash)) {
    return null;
  }

  return { ...registration };
}

export async function createDealerVehicle(
  input: CreateDealerVehicleInput,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreVehicle> {
  const brand = normalizeText(input.brand);
  const model = normalizeText(input.model);
  const year = Number(input.year);
  const km = Number(input.km);
  const price = Number(input.price);
  const image = normalizeImageUrl(input.image ?? "");
  const galleryRaw = Array.isArray(input.gallery) ? input.gallery : [];
  const gallery = [image, ...galleryRaw.map((entry) => normalizeImageUrl(entry))]
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .slice(0, 20);
  const bodyStyle = normalizeText(input.bodyStyle) || "Automovil";
  const fuelType = normalizeText(input.fuelType) || "Bencina";
  const transmission = normalizeText(input.transmission) || "Por confirmar";
  const location = normalizeText(input.location) || "Santiago";
  const description = normalizeText(input.description) || "Unidad publicada por dealer en C4R.";
  const channels = normalizeVehicleChannels(input.channels);
  const status = normalizeVehicleStatus(input.status ?? "disponible");

  const vehicleId = createId("sol");

  const nextState = await mutateStore((state) => {
    const vehicle: DealerStoreVehicle = {
      id: vehicleId,
      dealerId,
      brand,
      model,
      year,
      km,
      price,
      status,
      image,
      gallery,
      bodyStyle,
      fuelType,
      transmission,
      location,
      description,
      channels,
      publishedAt: toYmdNow(),
      updatedAt: toIsoNow(),
    };

    state.vehicles.unshift(vehicle);
    return state;
  });

  const created = nextState.vehicles.find((vehicle) => vehicle.id === vehicleId);
  if (!created) {
    throw new Error("No fue posible crear el vehiculo.");
  }

  return created;
}

export async function updateDealerVehicleStatus(
  vehicleId: string,
  status: VehicleStatus,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreVehicle | null> {
  const normalizedStatus = normalizeVehicleStatus(status);

  const nextState = await mutateStore((state) => {
    const vehicle = state.vehicles.find(
      (entry) => entry.id === vehicleId && entry.dealerId === dealerId,
    );
    if (!vehicle) {
      return state;
    }

    vehicle.status = normalizedStatus;
    vehicle.updatedAt = toIsoNow();
    return state;
  });

  return (
    nextState.vehicles.find(
      (vehicle) => vehicle.id === vehicleId && vehicle.dealerId === dealerId,
    ) ?? null
  );
}

export async function updateDealerVehicleChannel(
  vehicleId: string,
  channel: SalesChannel,
  enabled: boolean,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreVehicle | null> {
  const nextState = await mutateStore((state) => {
    const vehicle = state.vehicles.find(
      (entry) => entry.id === vehicleId && entry.dealerId === dealerId,
    );
    if (!vehicle) {
      return state;
    }

    const currentChannels = normalizeVehicleChannels(vehicle.channels);
    vehicle.channels = {
      ...currentChannels,
      [channel]: enabled,
    };
    vehicle.updatedAt = toIsoNow();
    return state;
  });

  return (
    nextState.vehicles.find(
      (vehicle) => vehicle.id === vehicleId && vehicle.dealerId === dealerId,
    ) ?? null
  );
}

export async function updateDealerLeadStage(
  leadId: string,
  stage: LeadStage,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreLead | null> {
  const normalizedStage = normalizeLeadStage(stage);

  const nextState = await mutateStore((state) => {
    const lead = state.leads.find(
      (entry) => entry.id === leadId && entry.dealerId === dealerId,
    );
    if (!lead) {
      return state;
    }

    lead.stage = normalizedStage;
    lead.updatedAt = toIsoNow();

    if (normalizedStage === "cerrado") {
      const vehicle = lead.requestId ? state.vehicles.find((entry) => entry.id === lead.requestId) : null;
      if (vehicle) {
        vehicle.status = "vendido";
        vehicle.updatedAt = toIsoNow();
      }

      const customer = state.customers.find(
        (entry) => entry.dealerId === lead.dealerId && normalizeText(entry.name) === normalizeText(lead.customer),
      );
      if (customer) {
        customer.purchases += 1;
        customer.updatedAt = toIsoNow();
      }

      if (!state.contracts.some((contract) => contract.requestHref === `/dealers/solicitud/${lead.requestId ?? lead.id}`)) {
        state.contracts.unshift({
          id: createId("ctr"),
          dealerId: lead.dealerId,
          type: "Compraventa",
          order: createId("ORD"),
          status: "firmado",
          fileLabel: `Contrato ${lead.id}.pdf`,
          requestHref: `/dealers/solicitud/${lead.requestId ?? lead.id}`,
          updatedAt: toIsoNow(),
        });
      }

      if (!state.payments.some((payment) => payment.order.includes(lead.id))) {
        state.payments.unshift({
          id: createId("pay"),
          dealerId: lead.dealerId,
          date: toYmdNow(),
          order: `ORD-${lead.id}`,
          method: "Transferencia",
          amount: 2500000,
          status: "confirmado",
          updatedAt: toIsoNow(),
        });
      }
    }

    return state;
  });

  return nextState.leads.find((lead) => lead.id === leadId && lead.dealerId === dealerId) ?? null;
}

export async function createFinancingRequest(
  input: CreateFinancingRequestInput,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreFinancingRequest> {
  const customer = normalizeText(input.customer);
  const vehicle = normalizeText(input.vehicle);
  const amount = Math.max(1, Number(input.amount) || 0);
  const rut = normalizeRut(normalizeText(input.rut ?? ""));
  const email = normalizeText(input.email ?? "").toLowerCase();
  const phone = normalizeText(input.phone ?? "");
  const monthlyIncome = Math.max(0, Number(input.monthlyIncome) || 0);
  const downPayment = Math.max(0, Number(input.downPayment) || 0);
  const termMonths = Math.max(12, Number(input.termMonths) || 36);
  const productType = normalizeFinancingProductType(normalizeText(input.productType ?? "convencional"));
  const assignedExecutive = normalizeText(input.assignedExecutive ?? "") || "Equipo Credito C4R";
  const financingId = createId("fin");

  const nextState = await mutateStore((state) => {
    const request = ensureFinancingRequestShape({
      id: financingId,
      dealerId,
      customer,
      vehicle,
      amount,
      status: "borrador",
      createdAt: toYmdNow(),
      rut,
      email,
      phone,
      monthlyIncome,
      downPayment,
      termMonths,
      productType,
      assignedExecutive,
      selectedOfferId: null,
      documents: defaultFinancingDocuments(),
      offers: [],
      updatedAt: toIsoNow(),
    });

    state.financingRequests.unshift(request);

    return state;
  });

  const created = nextState.financingRequests.find((request) => request.id === financingId);
  if (!created) {
    throw new Error("No fue posible crear la solicitud de credito.");
  }

  return ensureFinancingRequestShape(created);
}

export async function completeFinancingPaperwork(
  requestId: string,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find(
      (request) => request.id === requestId && request.dealerId === dealerId,
    );
    if (!existing) {
      return state;
    }

    const request = ensureFinancingRequestShape(existing);
    request.documents = (request.documents ?? defaultFinancingDocuments()).map((document) => ({
      ...document,
      status: "validado",
    }));
    request.paperworkScore = 100;
    if (request.status !== "aprobada" && request.status !== "rechazada") {
      request.status = "enviada";
    }
    request.updatedAt = toIsoNow();

    const requestIndex = state.financingRequests.findIndex((entry) => entry.id === requestId);
    state.financingRequests[requestIndex] = request;

    return state;
  });

  const updated = nextState.financingRequests.find(
    (request) => request.id === requestId && request.dealerId === dealerId,
  );
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function sendFinancingRequestToNetwork(
  requestId: string,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find(
      (request) => request.id === requestId && request.dealerId === dealerId,
    );
    if (!existing) {
      return state;
    }

    const request = ensureFinancingRequestShape(existing);
    const paperworkScore = request.paperworkScore ?? calculatePaperworkScore(request.documents ?? defaultFinancingDocuments());

    if (paperworkScore < 75) {
      request.status = "evaluando";
      request.offers = [];
      request.updatedAt = toIsoNow();
      const requestIndex = state.financingRequests.findIndex((entry) => entry.id === requestId);
      state.financingRequests[requestIndex] = request;
      return state;
    }

    request.offers = createFinancingOffers(request.id, request.amount, request.termMonths ?? 36, request.downPayment ?? 0);
    request.status = "ofertas";
    request.updatedAt = toIsoNow();
    request.selectedOfferId = null;

    const requestIndex = state.financingRequests.findIndex((entry) => entry.id === requestId);
    state.financingRequests[requestIndex] = request;

    const hasTask = state.tasks.some(
      (task) => task.dealerId === request.dealerId && task.title.includes(request.customer) && task.title.includes("financiamiento"),
    );
    if (!hasTask) {
      state.tasks.unshift({
        id: createId("task"),
        dealerId: request.dealerId,
        title: `Validar oferta de financiamiento para ${request.customer}`,
        dueLabel: "Hoy 17:00",
        owner: request.assignedExecutive || "Equipo Credito C4R",
        status: "pendiente",
        createdAt: toIsoNow(),
        updatedAt: toIsoNow(),
      });
    }

    return state;
  });

  const updated = nextState.financingRequests.find(
    (request) => request.id === requestId && request.dealerId === dealerId,
  );
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function selectFinancingOffer(
  requestId: string,
  offerId: string,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find(
      (request) => request.id === requestId && request.dealerId === dealerId,
    );
    if (!existing) {
      return state;
    }

    const request = ensureFinancingRequestShape(existing);
    const offerExists = (request.offers ?? []).some((offer) => offer.id === offerId);
    if (!offerExists) {
      return state;
    }

    request.offers = (request.offers ?? []).map((offer) => {
      if (offer.status === "rechazada") {
        return offer;
      }

      if (offer.id === offerId) {
        return { ...offer, status: "aprobada" };
      }

      return { ...offer, status: "preaprobada" };
    });

    request.selectedOfferId = offerId;
    request.status = "aprobada";
    request.updatedAt = toIsoNow();

    const requestIndex = state.financingRequests.findIndex((entry) => entry.id === requestId);
    state.financingRequests[requestIndex] = request;

    return state;
  });

  const updated = nextState.financingRequests.find(
    (request) => request.id === requestId && request.dealerId === dealerId,
  );
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function rejectFinancingRequest(
  requestId: string,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find(
      (request) => request.id === requestId && request.dealerId === dealerId,
    );
    if (!existing) {
      return state;
    }

    const request = ensureFinancingRequestShape(existing);
    request.status = "rechazada";
    request.selectedOfferId = null;
    request.updatedAt = toIsoNow();

    const requestIndex = state.financingRequests.findIndex((entry) => entry.id === requestId);
    state.financingRequests[requestIndex] = request;

    return state;
  });

  const updated = nextState.financingRequests.find(
    (request) => request.id === requestId && request.dealerId === dealerId,
  );
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function createLeadFromWebIntent(input: WebLeadInput): Promise<DealerStoreLead> {
  const fullName = normalizeText(input.fullName);
  const email = normalizeText(input.email).toLowerCase();
  const phone = normalizeText(input.phone);
  const vehicleTitle = normalizeText(input.vehicleTitle);
  const requestId = input.vehicleId.startsWith("sol-") ? input.vehicleId : undefined;
  const explicitDealerId = normalizeText(input.dealerId ?? "");

  const nextState = await mutateStore((state) => {
    const dealerFromInventory = state.vehicles.find((vehicle) => vehicle.id === input.vehicleId)?.dealerId ?? "";
    const requestedDealer =
      explicitDealerId || dealerFromInventory || (requestId ? dealerFromInventory : DEFAULT_DEALER_ID);
    const dealerId = state.registrations.some((registration) => registration.id === requestedDealer)
      ? requestedDealer
      : DEFAULT_DEALER_ID;

    const lead: DealerStoreLead = {
      id: createId("lead"),
      dealerId,
      requestId,
      customer: fullName,
      phone,
      interestVehicle: vehicleTitle,
      stage: "nuevo",
      assignedTo: "Equipo C4R",
      createdAt: toYmdNow(),
      email,
      source: input.source,
      updatedAt: toIsoNow(),
    };

    state.leads.unshift(lead);
    ensureCustomerFromLead(state, lead);

    state.tasks.unshift({
      id: createId("task"),
      dealerId,
      title: `Contactar ${fullName} por ${vehicleTitle}`,
      dueLabel: "Hoy 18:00",
      owner: "Equipo C4R",
      status: "pendiente",
      createdAt: toIsoNow(),
      updatedAt: toIsoNow(),
    });

    return state;
  });

  return nextState.leads[0];
}
