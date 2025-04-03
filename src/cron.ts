import prisma from "@/lib/db";
import { schedule } from "node-cron";
import { enviarWhatsApp } from "@/lib/whatsapp";
import { enviarCorreo } from "@/lib/email";

const SUPERADMIN_EMAIL = "admin@tuservicio.com";

schedule("0 8 * * *", async () => {
  console.log("🔔 Revisando impuestos próximos a vencer...");
  const hoy = new Date();

  const impuestos = await prisma.impuesto.findMany({
    where: {
      fechaVencimiento: {
        gte: hoy,
        lte: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      estado: "pendiente",
    },
  });

  let resumenSuperadmin = "📋 Vencimientos de impuestos del día:\n\n";

  for (const impuesto of impuestos) {
    const mensaje = `🔔 *Recordatorio de impuesto* 🔔\n\n` +
      `📌 *Impuesto:* ${impuesto.nombreImpuesto}\n` +
      `🏢 *Empresa:* ${impuesto.empresa}\n` +
      `🆔 *NIT:* ${impuesto.nit}\n` +
      `📅 *Fecha de Vencimiento:* ${impuesto.fechaVencimiento.toDateString()}\n\n` +
      `Por favor, realice el pago a tiempo.`;

    await enviarWhatsApp(impuesto.telefonoCliente, mensaje);
    await enviarCorreo(impuesto.emailCliente, "Recordatorio de Impuesto", mensaje);
    await enviarWhatsApp(impuesto.telefonoContador, mensaje);
    await enviarCorreo(impuesto.emailContador, "Recordatorio de Impuesto", mensaje);

    resumenSuperadmin += `📌 *${impuesto.nombreImpuesto}* - ${impuesto.empresa} - NIT ${impuesto.nit} - Vence el ${impuesto.fechaVencimiento.toDateString()}\n`;

    await prisma.impuesto.update({ where: { id: impuesto.id }, data: { estado: "enviado" } });
  }

  if (impuestos.length > 0) {
    await enviarCorreo(SUPERADMIN_EMAIL, "Resumen de vencimientos de impuestos", resumenSuperadmin);
  }

  console.log("✅ Recordatorios y resumen enviados.");
});
