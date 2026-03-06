import { type NextRequest, NextResponse } from "next/server";
import { getVehicleByPlate } from "@/lib/vehicle-check-data";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { plate?: string };
    const plate = body.plate?.trim();

    if (!plate) {
      return NextResponse.json({ error: "La patente es requerida." }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    const vehicleData = getVehicleByPlate(plate);

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

  const vehicleData = getVehicleByPlate(plate);

  if (!vehicleData) {
    return NextResponse.json({ error: "Vehiculo no encontrado." }, { status: 404 });
  }

  return NextResponse.json(vehicleData);
}
