import { type NextRequest, NextResponse } from "next/server";

type DealerRegistrationInput = {
  companyName?: string;
  companyRut?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type DealerRegistration = {
  id: string;
  companyName: string;
  companyRut: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

const registrations: DealerRegistration[] = [];

function normalizeText(value?: string): string {
  return (value ?? "").trim();
}

function normalizeRut(value: string): string {
  return value.replace(/[^0-9Kk.-]/g, "").toUpperCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidRut(value: string): boolean {
  return /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9K]$/.test(value);
}

function isValidPhone(value: string): boolean {
  const normalized = value.replace(/[^0-9]/g, "");
  return normalized.length >= 8 && normalized.length <= 12;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DealerRegistrationInput;

    const companyName = normalizeText(body.companyName);
    const companyRut = normalizeRut(normalizeText(body.companyRut));
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const address = normalizeText(body.address);

    if (!companyName || companyName.length < 3) {
      return NextResponse.json({ error: "Nombre de empresa invalido." }, { status: 400 });
    }

    if (!isValidRut(companyRut)) {
      return NextResponse.json({ error: "RUT invalido. Usa formato 12.345.678-9." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalido." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Telefono invalido." }, { status: 400 });
    }

    if (!address || address.length < 6) {
      return NextResponse.json({ error: "Direccion invalida." }, { status: 400 });
    }

    const registration: DealerRegistration = {
      id: `DLR-${Date.now().toString().slice(-6)}`,
      companyName,
      companyRut,
      email,
      phone,
      address,
      createdAt: new Date().toISOString(),
    };

    registrations.unshift(registration);

    return NextResponse.json(
      {
        message: "Solicitud enviada correctamente.",
        registrationId: registration.id,
        createdAt: registration.createdAt,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: registrations.length,
    registrations: registrations.slice(0, 20),
  });
}
