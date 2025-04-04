import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as xlsx from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const rows = xlsx.utils.sheet_to_json(sheet, { 
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });

    if (!rows.length) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    interface ImpuestoData {
      EMPRESA: string;
      NIT: string;
      NOMBRE_IMPUESTO: string;
      FECHA: string;
      EMAIL_CLIENTE: string;
      TELEFONO_CLIENTE: string;
      EMAIL_CONTADOR: string;
      TELEFONO_CONTADOR: string;
    }
    
    const results = [];
    const errores = [];
    
    for (const row of rows as ImpuestoData[]) {
      try {
        const nitString = String(row.NIT);
    
        let fechaCorrecta;
        try {
          if (/^\d+$/.test(row.FECHA)) {
            const excelSerialDate = parseInt(row.FECHA);
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const dateOffset = excelSerialDate > 60 ? 1 : 0;
            fechaCorrecta = new Date((excelSerialDate - dateOffset - 25569) * millisecondsPerDay);
          } else {
            fechaCorrecta = new Date(row.FECHA);
          }
          if (isNaN(fechaCorrecta.getTime())) {
            throw new Error('Fecha inválida');
          }
        } catch (error) {
          console.error(`Error al convertir fecha "${row.FECHA}":`, error);
          fechaCorrecta = new Date();
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailCliente = emailRegex.test(row.EMAIL_CLIENTE) ? row.EMAIL_CLIENTE : '';
        const emailContador = emailRegex.test(row.EMAIL_CONTADOR) ? row.EMAIL_CONTADOR : '';
        
        const impuesto = await prisma.impuesto.create({
          data: {
            empresa: row.EMPRESA || '',
            nit: nitString,
            nombreImpuesto: row.NOMBRE_IMPUESTO || '',
            fechaVencimiento: fechaCorrecta,
            emailCliente: emailCliente,
            telefonoCliente: row.TELEFONO_CLIENTE || '',
            emailContador: emailContador,
            telefonoContador: row.TELEFONO_CONTADOR || '',
          },
        });
        results.push(impuesto);
      } catch (error) {
        console.error("Error al procesar fila:", row, error);
        errores.push({
          fila: row,
        });
      }
    }

    return NextResponse.json({ 
      message: `Archivo procesado. Se importaron ${results.length} registros. Errores: ${errores.length}`,
      errores: errores.length > 0 ? errores : undefined
    });
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    return NextResponse.json({ 
       
    }, { status: 500 });
  }
}
