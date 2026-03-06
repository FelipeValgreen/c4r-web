import { type NextRequest, NextResponse } from "next/server";

type Severity = "low" | "medium" | "high";
type Recommendation = "buy" | "review" | "avoid";

type VehicleCheckResult = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel: string;
  transmission: string;
  mileage: number;
  owners: number;
  fines: {
    count: number;
    amount: number;
  };
  technicalReview: {
    valid: boolean;
    expiresAt: string;
  };
  insurance: {
    valid: boolean;
    company: string;
  };
  accidents: Array<{
    date: string;
    type: string;
    severity: Severity;
    description: string;
  }>;
  maintenance: Array<{
    date: string;
    mileage: number;
    type: string;
    workshop: string;
  }>;
  trustScore: number;
  recommendation: Recommendation;
};

const mockVehicleData: Record<string, VehicleCheckResult> = {
  ABCD12: {
    plate: "ABCD12",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blanco",
    fuel: "Gasolina",
    transmission: "Automatica",
    mileage: 45000,
    owners: 1,
    fines: { count: 0, amount: 0 },
    technicalReview: { valid: true, expiresAt: "2026-08-15" },
    insurance: { valid: true, company: "Mapfre" },
    accidents: [],
    maintenance: [
      {
        date: "2025-12-10",
        mileage: 40000,
        type: "Mantencion mayor",
        workshop: "Toyota Oficial",
      },
      {
        date: "2025-06-15",
        mileage: 35000,
        type: "Cambio de aceite",
        workshop: "Toyota Oficial",
      },
    ],
    trustScore: 95,
    recommendation: "buy",
  },
  XYZ123: {
    plate: "XYZ123",
    brand: "Chevrolet",
    model: "Spark",
    year: 2018,
    color: "Rojo",
    fuel: "Gasolina",
    transmission: "Manual",
    mileage: 78000,
    owners: 2,
    fines: { count: 2, amount: 45000 },
    technicalReview: { valid: false, expiresAt: "2025-11-20" },
    insurance: { valid: true, company: "Consorcio" },
    accidents: [
      {
        date: "2022-03-15",
        type: "Colision trasera",
        severity: "low",
        description: "Dano menor en parachoques trasero",
      },
    ],
    maintenance: [
      {
        date: "2025-08-20",
        mileage: 75000,
        type: "Cambio de aceite",
        workshop: "Taller Independiente",
      },
    ],
    trustScore: 65,
    recommendation: "review",
  },
  DEF456: {
    plate: "DEF456",
    brand: "Nissan",
    model: "Sentra",
    year: 2015,
    color: "Gris",
    fuel: "Gasolina",
    transmission: "Automatica",
    mileage: 120000,
    owners: 3,
    fines: { count: 5, amount: 180000 },
    technicalReview: { valid: false, expiresAt: "2025-05-10" },
    insurance: { valid: false, company: "" },
    accidents: [
      {
        date: "2021-09-10",
        type: "Colision frontal",
        severity: "medium",
        description: "Dano en capo y parachoques delantero",
      },
      {
        date: "2020-12-05",
        type: "Choque lateral",
        severity: "high",
        description: "Dano estructural en puerta del conductor",
      },
    ],
    maintenance: [
      {
        date: "2025-01-15",
        mileage: 115000,
        type: "Reparacion de motor",
        workshop: "Taller Independiente",
      },
    ],
    trustScore: 35,
    recommendation: "avoid",
  },
};

function normalizePlate(plate: string) {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { plate?: string };
    const plate = body.plate?.trim();

    if (!plate) {
      return NextResponse.json({ error: "La patente es requerida." }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    const vehicleData = mockVehicleData[normalizePlate(plate)];

    if (!vehicleData) {
      return NextResponse.json({ error: "Vehiculo no encontrado en la base de datos." }, { status: 404 });
    }

    return NextResponse.json(vehicleData);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const plate = request.nextUrl.searchParams.get("plate");

  if (!plate) {
    return NextResponse.json({ error: "La patente es requerida." }, { status: 400 });
  }

  const vehicleData = mockVehicleData[normalizePlate(plate)];

  if (!vehicleData) {
    return NextResponse.json({ error: "Vehiculo no encontrado." }, { status: 404 });
  }

  return NextResponse.json(vehicleData);
}
