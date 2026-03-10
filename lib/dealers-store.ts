import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, get as getBlob, put as putBlob } from "@vercel/blob";
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
  type FinancingRequest,
  type LeadStage,
  type VehicleStatus,
} from "@/app/dealers/_data";

const STORE_VERSION = 1;
const STORE_BLOB_PATH = normalizeText(process.env.DEALERS_STORE_BLOB_PATH) || "dealers/dealers-store.json";
const STORE_BLOB_TOKEN = normalizeText(process.env.BLOB_READ_WRITE_TOKEN);
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
};

let writeLock: Promise<void> = Promise.resolve();
let mutationLock: Promise<void> = Promise.resolve();

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
    financingRequests: seedFinancing.map((request) => ({
      ...request,
      dealerId: DEFAULT_DEALER_ID,
      updatedAt: now,
    })),
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
    const parsed = JSON.parse(raw) as DealerStoreState;
    if (parsed.version !== STORE_VERSION) {
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
    const blob = await getBlob(STORE_BLOB_PATH, {
      access: "private",
      useCache: false,
      token: STORE_BLOB_TOKEN,
    });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return null;
    }

    const raw = await new Response(blob.stream).text();
    const parsed = JSON.parse(raw) as DealerStoreState;
    if (parsed.version !== STORE_VERSION) {
      throw new Error("Unsupported store version");
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
      await putBlob(STORE_BLOB_PATH, JSON.stringify(nextState, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        token: STORE_BLOB_TOKEN,
        cacheControlMaxAge: 60,
      });
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
  const amount = Number(input.amount);

  const nextState = await mutateStore((state) => {
    state.financingRequests.unshift({
      id: createId("fin"),
      dealerId,
      customer,
      vehicle,
      amount,
      status: "enviada",
      createdAt: toYmdNow(),
      updatedAt: toIsoNow(),
    });

    return state;
  });

  return nextState.financingRequests[0];
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
