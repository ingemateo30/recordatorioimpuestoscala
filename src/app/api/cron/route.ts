import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enviarWhatsApp } from "@/lib/whatsapp";
import { enviarCorreoCliente, enviarCorreoAdmin } from "@/lib/email";

const SUPERADMIN_EMAIL = "sistemas@jelcom.com.co";

export async function GET(req: NextRequest) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Calcular la fecha de mañana
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    const impuestos = await prisma.impuesto.findMany({
      where: { fechaVencimiento: manana }
    });

    console.log(`📌 Encontrados ${impuestos.length} impuestos a pagar hoy.`);    

    if (impuestos.length === 0) {
      await enviarCorreoAdmin(SUPERADMIN_EMAIL, "✅ No hay impuestos a pagar hoy", []);
      return NextResponse.json({ message: "✅ No hay recordatorios pendientes para hoy." });
    }

    let enviados = 0;
    let errores = 0;
    let listaImpuestos = [];

    for (const impuesto of impuestos) {
      const mensajeWhatsApp = `🔔 Recordatorio: El impuesto *${impuesto.nombreImpuesto}* de la empresa *${impuesto.empresa}* vence hoy.`;

      try {
        
        //await enviarCorreoCliente(impuesto.emailCliente, impuesto);
        //await enviarCorreoCliente(impuesto.emailContador, impuesto);

        //await enviarWhatsApp(impuesto.telefonoCliente, mensajeWhatsApp);
        //await enviarWhatsApp(impuesto.telefonoContador, mensajeWhatsApp);

        listaImpuestos.push(impuesto);
        enviados++;
      } catch (error) {
        console.error(`❌ Error al enviar recordatorio para ${impuesto.empresa}:`, error);
        errores++;
      }
    }


    if (listaImpuestos.length > 0) {
      await enviarCorreoAdmin(SUPERADMIN_EMAIL, "📌 Resumen de Impuestos a Pagar Hoy", listaImpuestos);
    }

    return NextResponse.json({ 
      message: `✅ Recordatorios enviados: ${enviados}, ❌ Errores: ${errores}` 
    });

  } catch (error) {
    console.error("❌ Error en el proceso de recordatorios:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}






