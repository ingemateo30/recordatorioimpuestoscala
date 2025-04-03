import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as xlsx from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Obtener el buffer del archivo subido
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Leer el Excel directamente desde el buffer en memoria
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Configurar para convertir fechas de Excel automáticamente
    const rows = xlsx.utils.sheet_to_json(sheet, { 
      raw: false,  // Convierte todos los valores a strings
      dateNF: 'yyyy-mm-dd' // Formato para fechas
    });

    if (!rows.length) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    // Guardar en la base de datos
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
    
    // Procesar los datos y guardarlos en la base de datos
    const results = [];
    const errores = [];
    
    for (const row of rows as ImpuestoData[]) {
      try {
        // Convertir NIT a string si no lo es ya
        const nitString = String(row.NIT);
        
        // Convertir la fecha de Excel a Date
        let fechaCorrecta;
        try {
          // Si es un número de serie de Excel (como 45751)
          if (/^\d+$/.test(row.FECHA)) {
            // Convertir número de serie de Excel a fecha JavaScript
            // Excel usa días desde 1/1/1900 con peculiaridades
            const excelSerialDate = parseInt(row.FECHA);
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            // Excel tiene un bug con la fecha 29/2/1900 (que no existió)
            // Si el número es mayor a 60, restar 1 día
            const dateOffset = excelSerialDate > 60 ? 1 : 0;
            // La fecha base de Excel es 1/1/1900, pero JavaScript usa 1/1/1970
            // Hay 25569 días entre estas fechas (ajustando por la zona horaria)
            fechaCorrecta = new Date((excelSerialDate - dateOffset - 25569) * millisecondsPerDay);
          } else {
            // Si ya es una fecha en formato string
            fechaCorrecta = new Date(row.FECHA);
          }
          
          // Verificar si es una fecha válida
          if (isNaN(fechaCorrecta.getTime())) {
            throw new Error('Fecha inválida');
          }
        } catch (error) {
          console.error(`Error al convertir fecha "${row.FECHA}":`, error);
          fechaCorrecta = new Date(); // Fecha por defecto
        }

        // Validar correo electrónico
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
