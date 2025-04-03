import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import xlsx from "xlsx";
import { promises as fs } from "fs";
import { join } from "path";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = join(process.cwd(), "public", file.name);
  await fs.writeFile(filePath, buffer);

  // Leer archivo
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  // Guardar en la base de datos
  interface ImpuestoData {
    EMPRESA: string;
    NIT: string;
    NOMBRE_IMPUESTO: string;
    FECHA: string; // o Date si ya está en formato correcto
    EMAIL_CLIENTE: string;
    TELEFONO_CLIENTE: string;
    EMAIL_CONTADOR: string;
    TELEFONO_CONTADOR: string;
  }
  
  // Luego puedes tipar tus rows
  for (const row of rows as ImpuestoData[]) {
    await prisma.impuesto.create({
      data: {
        empresa: row.EMPRESA,
        nit: row.NIT,
        nombreImpuesto: row.NOMBRE_IMPUESTO,
        fechaVencimiento: new Date(row.FECHA),
        emailCliente: row.EMAIL_CLIENTE,
        telefonoCliente: row.TELEFONO_CLIENTE,
        emailContador: row.EMAIL_CONTADOR,
        telefonoContador: row.TELEFONO_CONTADOR,
      },
    });
  }

  return NextResponse.json({ message: "Archivo procesado correctamente" });
}
