export type Severity = "low" | "medium" | "high";
export type Recommendation = "buy" | "review" | "avoid";

export type VehicleCheckResult = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel: string;
  transmission: string;
  mileage: number;
  marketPrice: number;
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

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const mockVehicleData: Record<string, VehicleCheckResult> = {
  ABCD12: {
    plate: "ABCD12",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blanco",
    fuel: "Gasolina",
    transmission: "Automatica",
    mileage: 45000,
    marketPrice: 12490000,
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
    marketPrice: 8900000,
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
    marketPrice: 6900000,
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

export function getVehicleByPlate(plate: string): VehicleCheckResult | null {
  return mockVehicleData[normalizePlate(plate)] ?? null;
}
