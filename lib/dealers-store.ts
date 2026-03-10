import "server-only";

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
  dealerTasks as seedTasks,
  dealerVehicles as seedVehicles,
  financingRequests as seedFinancing,
  type DealerContract,
  type DealerCustomer,
  type DealerLead,
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

export const DEFAULT_DEALER_ID = "DLR-C4R-DEMO";

export type DealerRegistrationStatus = "pendiente" | "activo" | "rechazado";

export type DealerRegistration = {
  id: string;
  companyName: string;
  companyRut: string;
  email: string;
  phone: string;
  address: string;
  status: DealerRegistrationStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type DealerStoreVehicle = DealerVehicle & {
  dealerId: string;
  updatedAt: string;
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
  registrations: DealerRegistration[];
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
};

type CreateDealerVehicleInput = {
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  image?: string;
  status?: VehicleStatus;
};

type WebLeadInput = {
  vehicleId: string;
  vehicleTitle: string;
  fullName: string;
  email: string;
  phone: string;
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
        status: "activo",
        createdAt: now,
        reviewedAt: now,
      },
    ],
    vehicles: seedVehicles.map((vehicle) => ({
      ...vehicle,
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

async function ensureStore(): Promise<DealerStoreState> {
  if (USE_BLOB_STORE) {
    const blobState = await readStoreFromBlob();
    if (blobState) {
      return cloneState(blobState);
    }

    const initial = createInitialStoreState();
    await persistStore(initial);
    return cloneState(initial);
  }

  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoreState(parsed)) {
      throw new Error("Unsupported store version");
    }
    return cloneState(parsed);
  } catch {
    const initial = createInitialStoreState();
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
      .map((registration) => ({ ...registration })),
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

export async function registerDealer(input: RegisterDealerInput): Promise<DealerRegistration> {
  const companyName = normalizeText(input.companyName);
  const companyRut = normalizeRut(normalizeText(input.companyRut));
  const email = normalizeText(input.email).toLowerCase();
  const phone = normalizeText(input.phone);
  const address = normalizeText(input.address);

  const nextState = await mutateStore((state) => {
    const rutExists = state.registrations.some((registration) => registration.companyRut === companyRut);
    if (rutExists) {
      throw new Error("Ya existe una solicitud con ese RUT.");
    }

    const emailExists = state.registrations.some((registration) => registration.email.toLowerCase() === email);
    if (emailExists) {
      throw new Error("Ya existe una solicitud con ese correo.");
    }

    const registration: DealerRegistration = {
      id: createId("DLR"),
      companyName,
      companyRut,
      email,
      phone,
      address,
      status: "pendiente",
      createdAt: toIsoNow(),
      reviewedAt: null,
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

export async function createDealerVehicle(
  input: CreateDealerVehicleInput,
  dealerId: string = DEFAULT_DEALER_ID,
): Promise<DealerStoreVehicle> {
  const brand = normalizeText(input.brand);
  const model = normalizeText(input.model);
  const year = Number(input.year);
  const km = Number(input.km);
  const price = Number(input.price);
  const image = normalizeText(input.image) || "/car-placeholder.svg";
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
): Promise<DealerStoreVehicle | null> {
  const normalizedStatus = normalizeVehicleStatus(status);

  const nextState = await mutateStore((state) => {
    const vehicle = state.vehicles.find((entry) => entry.id === vehicleId);
    if (!vehicle) {
      return state;
    }

    vehicle.status = normalizedStatus;
    vehicle.updatedAt = toIsoNow();
    return state;
  });

  return nextState.vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
}

export async function updateDealerLeadStage(
  leadId: string,
  stage: LeadStage,
): Promise<DealerStoreLead | null> {
  const normalizedStage = normalizeLeadStage(stage);

  const nextState = await mutateStore((state) => {
    const lead = state.leads.find((entry) => entry.id === leadId);
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

  return nextState.leads.find((lead) => lead.id === leadId) ?? null;
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

export async function completeFinancingPaperwork(requestId: string): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find((request) => request.id === requestId);
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

  const updated = nextState.financingRequests.find((request) => request.id === requestId);
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function sendFinancingRequestToNetwork(requestId: string): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find((request) => request.id === requestId);
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

  const updated = nextState.financingRequests.find((request) => request.id === requestId);
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function selectFinancingOffer(
  requestId: string,
  offerId: string,
): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find((request) => request.id === requestId);
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

  const updated = nextState.financingRequests.find((request) => request.id === requestId);
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function rejectFinancingRequest(requestId: string): Promise<DealerStoreFinancingRequest | null> {
  const nextState = await mutateStore((state) => {
    const existing = state.financingRequests.find((request) => request.id === requestId);
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

  const updated = nextState.financingRequests.find((request) => request.id === requestId);
  return updated ? ensureFinancingRequestShape(updated) : null;
}

export async function createLeadFromWebIntent(input: WebLeadInput): Promise<DealerStoreLead> {
  const fullName = normalizeText(input.fullName);
  const email = normalizeText(input.email).toLowerCase();
  const phone = normalizeText(input.phone);
  const vehicleTitle = normalizeText(input.vehicleTitle);
  const requestId = input.vehicleId.startsWith("sol-") ? input.vehicleId : undefined;

  const nextState = await mutateStore((state) => {
    const lead: DealerStoreLead = {
      id: createId("lead"),
      dealerId: DEFAULT_DEALER_ID,
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
      dealerId: DEFAULT_DEALER_ID,
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
