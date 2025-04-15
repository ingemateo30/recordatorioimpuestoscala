import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enviarWhatsApp } from "@/lib/whatsapp";
import { enviarCorreoCliente, enviarCorreoAdmin } from "@/lib/email";
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "rocio@calaasociados.com";
const DIAS_ANTICIPACION = [1]; 

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const testMode = url.searchParams.get("test") === "true";
    const specificDate = url.searchParams.get("fecha");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const resultados = {
      enviados: 0,
      errores: 0,
      notificaciones: {
        email: 0,
        whatsapp: 0
      },
      impuestos: [] as any[]
    };
    for (const dias of DIAS_ANTICIPACION) {
      const fechaObjetivo = new Date(hoy);
      fechaObjetivo.setDate(hoy.getDate() + dias);
      const fechaConsulta = specificDate ? new Date(specificDate) : fechaObjetivo;
      const impuestos = await prisma.impuesto.findMany({
        where: {
          fechaVencimiento: {
            equals: fechaConsulta
          }
        }
      });
      console.log(`📅 Encontrados ${impuestos.length} impuestos que vencen en ${dias} día(s) (${fechaConsulta.toISOString().split('T')[0]})`);
      for (const impuesto of impuestos) {
        const infoImpuesto = {
          id: impuesto.id,
          empresa: impuesto.empresa,
          nit: impuesto.nit,
          nombreImpuesto: impuesto.nombreImpuesto,
          fechaVencimiento: impuesto.fechaVencimiento,
          diasRestantes: dias,
          emailCliente: impuesto.emailCliente,
          error: null
        };

        try {
          const mensajeWhatsApp = dias === 1
            ? `🚨 URGENTE: El impuesto *${impuesto.nombreImpuesto}* de la empresa *${impuesto.empresa}* vence MAÑANA.`
            : `🔔 Recordatorio: El impuesto *${impuesto.nombreImpuesto}* de la empresa *${impuesto.empresa}* vence en ${dias} días (${impuesto.fechaVencimiento.toISOString().split('T')[0]}).`;
          if (!testMode) {
            if (infoImpuesto.emailCliente !== null) {
              await enviarCorreoCliente(infoImpuesto.emailCliente, impuesto);
              resultados.notificaciones.email++;
            }
           
            if (impuesto.emailContador?.includes('@') ||
            impuesto.emailContador !== impuesto.emailCliente) {
            await enviarCorreoCliente(impuesto.emailContador!, impuesto);
            resultados.notificaciones.email++;
          }
          
            if (impuesto.telefonoCliente && /^\+?\d{10,15}$/.test(impuesto.telefonoCliente)) {
              await enviarWhatsApp(impuesto.telefonoCliente, mensajeWhatsApp);
              resultados.notificaciones.whatsapp++;
            }
            if (impuesto.telefonoContador && /^\+?\d{10,15}$/.test(impuesto.telefonoContador) &&
              impuesto.telefonoContador !== impuesto.telefonoCliente) {
              await enviarWhatsApp(impuesto.telefonoContador, mensajeWhatsApp);
              resultados.notificaciones.whatsapp++;
            }
          } else {
            console.log(`Simulando envío para: ${impuesto.empresa} - ${impuesto.nombreImpuesto}`);
          }
          resultados.enviados++;
        } catch (error: any) {
          console.error(`❌ Error al enviar recordatorio para ${impuesto.empresa}:`, error);
          infoImpuesto.error = error.message || "Error desconocido";
          resultados.errores++;
        }
        resultados.impuestos.push(infoImpuesto);
      }
    }
    if (resultados.impuestos.length > 0) {
      try {
        await enviarCorreoAdmin(
          SUPERADMIN_EMAIL,
          `📊 Reporte diario de recordatorios de impuestos`,
          resultados.impuestos
        );
      } catch (error) {
        console.error("Error al enviar correo de resumen al administrador:", error);
      }
    } else {
      try {
        await enviarCorreoAdmin(
          SUPERADMIN_EMAIL,
          `✅ No hay impuestos próximos a vencer (${testMode ? "PRUEBA" : "PRODUCCIÓN"})`,
          []
        );
      } catch (error) {
        console.error("Error al enviar correo de 'sin impuestos' al administrador:", error);
      }
    }
    return NextResponse.json({
      success: true,
      testMode,
      mensaje: testMode ? "[MODO PRUEBA] Simulación completada" : "Proceso completado",
      resultados: {
        total: resultados.impuestos.length,
        enviados: resultados.enviados,
        errores: resultados.errores,
        notificaciones: resultados.notificaciones
      }
    });
  } catch (error: any) {
    console.error("❌ Error crítico en el proceso de recordatorios:", error);
  }
}






