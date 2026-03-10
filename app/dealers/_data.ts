export type DealerNavLink = {
  href: string;
  label: string;
};

export const dealerNavLinks: DealerNavLink[] = [
  { href: "/dealers", label: "Dashboard" },
  { href: "/dealers/inventory", label: "Inventario" },
  { href: "/dealers/leads", label: "Leads" },
  { href: "/dealers/customers", label: "Clientes" },
  { href: "/dealers/tasks", label: "Tareas" },
  { href: "/dealers/financing", label: "Financiamiento" },
  { href: "/dealers/payments", label: "Pagos" },
  { href: "/dealers/contracts", label: "Contratos" },
  { href: "/dealers/reports", label: "Reportes" },
  { href: "/dealers/registro", label: "Registro dealer" },
];

export type VehicleStatus = "disponible" | "reservado" | "vendido";

export type DealerVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  status: VehicleStatus;
  image: string;
  publishedAt: string;
};

export const dealerVehicles: DealerVehicle[] = [
  {
    id: "sol-1001",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    km: 45200,
    price: 12490000,
    status: "disponible",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-02-12",
  },
  {
    id: "sol-1002",
    brand: "Kia",
    model: "Sportage",
    year: 2021,
    km: 33800,
    price: 18200000,
    status: "reservado",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-02-09",
  },
  {
    id: "sol-1003",
    brand: "Hyundai",
    model: "Tucson",
    year: 2020,
    km: 51700,
    price: 16750000,
    status: "disponible",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-02-05",
  },
  {
    id: "sol-1004",
    brand: "Mazda",
    model: "CX-5",
    year: 2019,
    km: 60210,
    price: 15300000,
    status: "vendido",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-01-28",
  },
  {
    id: "sol-1005",
    brand: "Nissan",
    model: "Qashqai",
    year: 2022,
    km: 21500,
    price: 20990000,
    status: "disponible",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-02-19",
  },
  {
    id: "sol-1006",
    brand: "Peugeot",
    model: "3008",
    year: 2021,
    km: 29000,
    price: 19400000,
    status: "reservado",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=650&q=80",
    publishedAt: "2026-02-16",
  },
];

export type LeadStage = "nuevo" | "contactado" | "oferta" | "cerrado";

export type DealerLead = {
  id: string;
  requestId?: string;
  customer: string;
  phone: string;
  interestVehicle: string;
  stage: LeadStage;
  assignedTo: string;
  createdAt: string;
};

export const dealerLeads: DealerLead[] = [
  {
    id: "lead-3001",
    requestId: "sol-1002",
    customer: "Sofia Martinez",
    phone: "+56 9 9482 1130",
    interestVehicle: "Kia Sportage 2021",
    stage: "nuevo",
    assignedTo: "Felipe",
    createdAt: "2026-03-04",
  },
  {
    id: "lead-3002",
    requestId: "sol-1001",
    customer: "Javier Rojas",
    phone: "+56 9 7255 6320",
    interestVehicle: "Toyota Corolla 2020",
    stage: "contactado",
    assignedTo: "Camila",
    createdAt: "2026-03-03",
  },
  {
    id: "lead-3003",
    requestId: "sol-1003",
    customer: "Maria Lopez",
    phone: "+56 9 6102 9008",
    interestVehicle: "Hyundai Tucson 2020",
    stage: "oferta",
    assignedTo: "Felipe",
    createdAt: "2026-03-02",
  },
  {
    id: "lead-3004",
    requestId: "sol-1005",
    customer: "Diego Acuna",
    phone: "+56 9 4520 8841",
    interestVehicle: "Nissan Qashqai 2022",
    stage: "cerrado",
    assignedTo: "Daniela",
    createdAt: "2026-03-01",
  },
];

export type DealerCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  purchases: number;
};

export const dealerCustomers: DealerCustomer[] = [
  {
    id: "cus-01",
    name: "Juan Perez",
    email: "juan.perez@email.com",
    phone: "+56 9 8123 4421",
    city: "Santiago",
    purchases: 2,
  },
  {
    id: "cus-02",
    name: "Camila Rojas",
    email: "camila.rojas@email.com",
    phone: "+56 9 7311 2044",
    city: "Valparaiso",
    purchases: 1,
  },
  {
    id: "cus-03",
    name: "Sebastian Muñoz",
    email: "sebastian.munoz@email.com",
    phone: "+56 9 6550 9981",
    city: "Concepcion",
    purchases: 3,
  },
  {
    id: "cus-04",
    name: "Natalia Silva",
    email: "natalia.silva@email.com",
    phone: "+56 9 5772 3910",
    city: "La Serena",
    purchases: 1,
  },
];

export type DealerTask = {
  id: string;
  title: string;
  dueLabel: string;
  owner: string;
  status: "pendiente" | "en progreso" | "completada";
};

export const dealerTasks: DealerTask[] = [
  {
    id: "task-01",
    title: "Llamar lead Toyota Corolla",
    dueLabel: "Hoy 16:30",
    owner: "Felipe",
    status: "pendiente",
  },
  {
    id: "task-02",
    title: "Enviar propuesta Nissan Qashqai",
    dueLabel: "Hoy 18:00",
    owner: "Camila",
    status: "en progreso",
  },
  {
    id: "task-03",
    title: "Subir fotos nuevas Mazda CX-5",
    dueLabel: "Manana 11:00",
    owner: "Daniela",
    status: "pendiente",
  },
  {
    id: "task-04",
    title: "Cerrar documentacion venta Kia",
    dueLabel: "Ayer 17:00",
    owner: "Felipe",
    status: "completada",
  },
];

export type FinancingStatus = "borrador" | "enviada" | "evaluando" | "ofertas" | "aprobada" | "rechazada";

export type FinancingDocumentStatus = "pendiente" | "cargado" | "validado";

export type FinancingDocument = {
  id: string;
  label: string;
  status: FinancingDocumentStatus;
};

export type FinancingOfferStatus = "preaprobada" | "aprobada" | "rechazada";

export type FinancingOffer = {
  id: string;
  lender: string;
  approvedAmount: number;
  termMonths: number;
  annualRate: number;
  monthlyFee: number;
  status: FinancingOfferStatus;
};

export type FinancingProductType = "convencional" | "inteligente" | "leasing";

export type FinancingRequest = {
  id: string;
  customer: string;
  vehicle: string;
  amount: number;
  status: FinancingStatus;
  createdAt: string;
  rut?: string;
  email?: string;
  phone?: string;
  monthlyIncome?: number;
  downPayment?: number;
  termMonths?: number;
  productType?: FinancingProductType;
  assignedExecutive?: string;
  paperworkScore?: number;
  selectedOfferId?: string | null;
  documents?: FinancingDocument[];
  offers?: FinancingOffer[];
};

export const financingRequests: FinancingRequest[] = [
  {
    id: "fin-001",
    customer: "Javier Rojas",
    vehicle: "Toyota Corolla 2020",
    amount: 9900000,
    status: "aprobada",
    createdAt: "2026-03-02",
    rut: "16.234.987-5",
    email: "jrojas@email.com",
    phone: "+56 9 7255 6320",
    monthlyIncome: 2350000,
    downPayment: 2500000,
    termMonths: 36,
    productType: "convencional",
    assignedExecutive: "Camila",
    paperworkScore: 100,
    selectedOfferId: "off-001-a",
    documents: [
      { id: "doc-id", label: "Cedula de identidad", status: "validado" },
      { id: "doc-income", label: "Liquidaciones y cotizaciones", status: "validado" },
      { id: "doc-address", label: "Comprobante de domicilio", status: "validado" },
      { id: "doc-credit", label: "Pre-evaluacion crediticia", status: "validado" },
    ],
    offers: [
      {
        id: "off-001-a",
        lender: "Banco Andino",
        approvedAmount: 7400000,
        termMonths: 36,
        annualRate: 11.2,
        monthlyFee: 268000,
        status: "aprobada",
      },
      {
        id: "off-001-b",
        lender: "Financiera Ruta",
        approvedAmount: 7200000,
        termMonths: 36,
        annualRate: 12.4,
        monthlyFee: 277000,
        status: "preaprobada",
      },
    ],
  },
  {
    id: "fin-002",
    customer: "Maria Lopez",
    vehicle: "Hyundai Tucson 2020",
    amount: 11800000,
    status: "ofertas",
    createdAt: "2026-03-04",
    rut: "17.445.280-1",
    email: "mlopez@email.com",
    phone: "+56 9 6102 9008",
    monthlyIncome: 2100000,
    downPayment: 1800000,
    termMonths: 48,
    productType: "inteligente",
    assignedExecutive: "Felipe",
    paperworkScore: 100,
    selectedOfferId: null,
    documents: [
      { id: "doc-id", label: "Cedula de identidad", status: "validado" },
      { id: "doc-income", label: "Liquidaciones y cotizaciones", status: "validado" },
      { id: "doc-address", label: "Comprobante de domicilio", status: "validado" },
      { id: "doc-credit", label: "Pre-evaluacion crediticia", status: "validado" },
    ],
    offers: [
      {
        id: "off-002-a",
        lender: "Banco Pacifico",
        approvedAmount: 9800000,
        termMonths: 48,
        annualRate: 12.9,
        monthlyFee: 254000,
        status: "preaprobada",
      },
      {
        id: "off-002-b",
        lender: "CrediMovil",
        approvedAmount: 10000000,
        termMonths: 48,
        annualRate: 13.5,
        monthlyFee: 261000,
        status: "preaprobada",
      },
    ],
  },
  {
    id: "fin-003",
    customer: "Sofia Martinez",
    vehicle: "Kia Sportage 2021",
    amount: 13100000,
    status: "enviada",
    createdAt: "2026-03-05",
    rut: "18.331.764-9",
    email: "smartinez@email.com",
    phone: "+56 9 9482 1130",
    monthlyIncome: 1750000,
    downPayment: 1600000,
    termMonths: 48,
    productType: "convencional",
    assignedExecutive: "Felipe",
    paperworkScore: 75,
    selectedOfferId: null,
    documents: [
      { id: "doc-id", label: "Cedula de identidad", status: "validado" },
      { id: "doc-income", label: "Liquidaciones y cotizaciones", status: "cargado" },
      { id: "doc-address", label: "Comprobante de domicilio", status: "cargado" },
      { id: "doc-credit", label: "Pre-evaluacion crediticia", status: "pendiente" },
    ],
    offers: [],
  },
  {
    id: "fin-004",
    customer: "Raul Pino",
    vehicle: "Mazda CX-5 2019",
    amount: 10200000,
    status: "rechazada",
    createdAt: "2026-02-27",
    rut: "14.998.450-2",
    email: "rpino@email.com",
    phone: "+56 9 6630 9921",
    monthlyIncome: 1050000,
    downPayment: 1000000,
    termMonths: 60,
    productType: "leasing",
    assignedExecutive: "Camila",
    paperworkScore: 85,
    selectedOfferId: null,
    documents: [
      { id: "doc-id", label: "Cedula de identidad", status: "validado" },
      { id: "doc-income", label: "Liquidaciones y cotizaciones", status: "validado" },
      { id: "doc-address", label: "Comprobante de domicilio", status: "validado" },
      { id: "doc-credit", label: "Pre-evaluacion crediticia", status: "validado" },
    ],
    offers: [
      {
        id: "off-004-a",
        lender: "Banco Andino",
        approvedAmount: 0,
        termMonths: 60,
        annualRate: 0,
        monthlyFee: 0,
        status: "rechazada",
      },
    ],
  },
];

export type DealerPayment = {
  id: string;
  date: string;
  order: string;
  method: "Transferencia" | "Tarjeta" | "Webpay";
  amount: number;
  status: "confirmado" | "pendiente";
};

export const dealerPayments: DealerPayment[] = [
  {
    id: "pay-1001",
    date: "2026-03-01",
    order: "ORD-2041",
    method: "Transferencia",
    amount: 3000000,
    status: "confirmado",
  },
  {
    id: "pay-1002",
    date: "2026-03-03",
    order: "ORD-2042",
    method: "Tarjeta",
    amount: 1500000,
    status: "pendiente",
  },
  {
    id: "pay-1003",
    date: "2026-03-05",
    order: "ORD-2043",
    method: "Webpay",
    amount: 2400000,
    status: "confirmado",
  },
];

export type DealerContract = {
  id: string;
  type: string;
  order: string;
  status: "borrador" | "firmado" | "revision";
  fileLabel?: string;
  requestHref?: string;
};

export const dealerContracts: DealerContract[] = [
  {
    id: "ctr-01",
    type: "Compraventa",
    order: "ORD-2041",
    status: "firmado",
    fileLabel: "Contrato ORD-2041.pdf",
    requestHref: "/dealers/solicitud/sol-1001",
  },
  {
    id: "ctr-02",
    type: "Garantia extendida",
    order: "ORD-2042",
    status: "revision",
    requestHref: "/dealers/solicitud/sol-1002",
  },
  {
    id: "ctr-03",
    type: "Reserva unidad",
    order: "ORD-2043",
    status: "borrador",
    requestHref: "/dealers/solicitud/sol-1003",
  },
];

export function formatClp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
