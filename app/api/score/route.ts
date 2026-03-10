import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import { getVehicleByPlate } from "@/lib/vehicle-check-data";

type CheckState = "green" | "yellow" | "red";

type ScoreResponse = {
  plate: string;
  score: number;
  label: "Excelente" | "Bueno" | "Regular" | "Bajo";
  vehicle: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
  };
  checks: {
    multas: CheckState;
    prendas: CheckState;
    siniestros: CheckState;
    tag: CheckState;
    revision: CheckState;
    emisiones: CheckState;
  };
  highlights: string[];
};

function scoreLabel(score: number): ScoreResponse["label"] {
  if (score >= 80) {
    return "Excelente";
  }

  if (score >= 60) {
    return "Bueno";
  }

  if (score >= 40) {
    return "Regular";
  }

  return "Bajo";
}

function toCheckState(score: number, goodThreshold: number, mediumThreshold: number): CheckState {
  if (score >= goodThreshold) {
    return "green";
  }

  if (score >= mediumThreshold) {
    return "yellow";
  }

  return "red";
}

function buildChecks(vehicle: ReturnType<typeof getVehicleByPlate>) {
  if (!vehicle) {
    return null;
  }

  const hasHighSeverityAccident = vehicle.accidents.some((item) => item.severity === "high");

  const multas: CheckState = vehicle.fines.count === 0 ? "green" : vehicle.fines.count <= 2 ? "yellow" : "red";
  const prendas: CheckState = vehicle.owners <= 1 ? "green" : vehicle.owners <= 2 ? "yellow" : "red";
  const siniestros: CheckState = vehicle.accidents.length === 0 ? "green" : hasHighSeverityAccident ? "red" : "yellow";
  const tag: CheckState = vehicle.fines.amount === 0 ? "green" : vehicle.fines.amount <= 50000 ? "yellow" : "red";
  const revision: CheckState = vehicle.technicalReview.valid ? "green" : "red";

  const emisionesBaseScore = vehicle.year >= 2019 ? 90 : vehicle.year >= 2016 ? 65 : 35;
  const emisiones = toCheckState(emisionesBaseScore, 80, 50);

  return {
    multas,
    prendas,
    siniestros,
    tag,
    revision,
    emisiones,
  };
}

function buildHighlights(vehicle: NonNullable<ReturnType<typeof getVehicleByPlate>>): string[] {
  const highlights: string[] = [];

  if (vehicle.fines.count === 0) {
    highlights.push("Sin multas pendientes registradas.");
  } else {
    highlights.push(`Tiene ${vehicle.fines.count} multa(s) por ${vehicle.fines.amount.toLocaleString("es-CL")}.`);
  }

  if (vehicle.accidents.length === 0) {
    highlights.push("No se reportan accidentes en el historial disponible.");
  } else {
    highlights.push(`Se registran ${vehicle.accidents.length} evento(s) de accidente.`);
  }

  highlights.push(
    vehicle.technicalReview.valid
      ? `Revision tecnica vigente hasta ${vehicle.technicalReview.expiresAt}.`
      : "Revision tecnica vencida: requiere regularizacion."
  );

  return highlights;
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:score:post", { limit: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas consultas de score en un minuto.", rateLimit.retryAfterSeconds);
  }

  try {
    const body = (await request.json()) as { plate?: string };
    const plate = body.plate?.trim();

    if (!plate) {
      return NextResponse.json({ error: "La patente es requerida." }, { status: 400 });
    }

    const vehicle = getVehicleByPlate(plate);

    if (!vehicle) {
      return NextResponse.json({ error: "Vehiculo no encontrado en la base de datos." }, { status: 404 });
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const response: ScoreResponse = {
      plate: vehicle.plate,
      score: vehicle.trustScore,
      label: scoreLabel(vehicle.trustScore),
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        price: vehicle.marketPrice,
      },
      checks: buildChecks(vehicle)!,
      highlights: buildHighlights(vehicle),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:score:get", { limit: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas consultas de score en un minuto.", rateLimit.retryAfterSeconds);
  }

  const plate = request.nextUrl.searchParams.get("plate")?.trim();

  if (!plate) {
    return NextResponse.json({ error: "La patente es requerida." }, { status: 400 });
  }

  const vehicle = getVehicleByPlate(plate);

  if (!vehicle) {
    return NextResponse.json({ error: "Vehiculo no encontrado en la base de datos." }, { status: 404 });
  }

  const response: ScoreResponse = {
    plate: vehicle.plate,
    score: vehicle.trustScore,
    label: scoreLabel(vehicle.trustScore),
    vehicle: {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      price: vehicle.marketPrice,
    },
    checks: buildChecks(vehicle)!,
    highlights: buildHighlights(vehicle),
  };

  return NextResponse.json(response);
}
