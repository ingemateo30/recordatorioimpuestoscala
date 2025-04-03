import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enviarWhatsApp } from "@/lib/whatsapp";
import { enviarCorreoCliente, enviarCorreoAdmin } from "@/lib/email";

const SUPERADMIN_EMAIL = "msalazar5@udi.edu.co"; // Correo del superadministrador

export async function GET(req: NextRequest) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar impuestos que vencen hoy
    const impuestos = await prisma.impuesto.findMany({
      where: { fechaVencimiento: hoy }
    });

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
        // Enviar correo al cliente y al contador
        await enviarCorreoCliente(impuesto.emailCliente, impuesto);
        await enviarCorreoCliente(impuesto.emailContador, impuesto);

        // Enviar WhatsApp
        await enviarWhatsApp(impuesto.telefonoCliente, mensajeWhatsApp);
        await enviarWhatsApp(impuesto.telefonoContador, mensajeWhatsApp);

        // Agregar a la lista de impuestos para el resumen del admin
        listaImpuestos.push(impuesto);
        enviados++;
      } catch (error) {
        console.error(`❌ Error al enviar recordatorio para ${impuesto.nombreImpuesto}:`, error);
        errores++;
      }
    }

    // Enviar resumen al superadministrador
    await enviarCorreoAdmin(SUPERADMIN_EMAIL, "📌 Resumen de Impuestos a Pagar Hoy", listaImpuestos);

    return NextResponse.json({ 
      message: `✅ Recordatorios enviados: ${enviados}, ❌ Errores: ${errores}` 
    });

  } catch (error) {
    console.error("❌ Error en el proceso de recordatorios:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}






