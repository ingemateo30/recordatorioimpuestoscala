import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const LOGO_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/cala.png`;

// 📧 Enviar correo a clientes y contadores con recordatorio del impuesto
export async function enviarCorreoCliente(destino: string, impuesto: any) {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center;">
        <img src="${LOGO_URL}" alt="Logo de la empresa" style="max-width: 150px; margin-bottom: 20px;">
        <h2 style="color: #333;">📢 Recordatorio de Impuesto</h2>
      </div>

      <div style="background: white; padding: 15px; border-radius: 8px;">
        <p style="color: #555; font-size: 16px;">Estimado(a),</p>
        <p style="color: #555; font-size: 16px;">Le recordamos que el impuesto <strong>${impuesto.nombreImpuesto}</strong> de la empresa <strong>${impuesto.empresa}</strong> (NIT: ${impuesto.nit}) vence hoy.</p>

        <div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 15px 0;">
          <p style="margin: 5px 0; font-size: 18px;"><strong>Fecha de vencimiento:</strong> ${new Date(impuesto.fechaVencimiento).toLocaleDateString()}</p>
        </div>

        <p style="color: #555; font-size: 14px;">Por favor, asegúrese de realizar el pago a tiempo para evitar sanciones.</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 14px; color: #777;">Atentamente,</p>
        <p style="font-size: 16px; font-weight: bold; color: #333;">Cala Asociados - Contadores Públicos</p>
        <p style="font-size: 14px; color: #777;">📍 Dirección de la empresa | 📞 Teléfono de contacto</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destino,
        subject: "📌 Recordatorio de Impuesto",
        html: htmlContent,
    });

    console.log(`📧 Correo enviado a ${destino}`);
}


export async function enviarCorreoAdmin(destino: string, asunto: string, impuestos: any[]) {
    let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center;">
        <img src="${LOGO_URL}" alt="Logo de la empresa" style="max-width: 150px; margin-bottom: 20px;">
        <h2 style="color: #333;">📌 Resumen de Impuestos a Pagar Hoy</h2>
      </div>

      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background: #007bff; color: white;">
            <th>Empresa</th>
            <th>Impuesto</th>
            <th>NIT</th>
            <th>Email Cliente</th>
            <th>Email Contador</th>
          </tr>
        </thead>
        <tbody>
  `;

    if (impuestos.length === 0) {
        htmlContent += `
      <tr>
        <td colspan="5" style="text-align: center; padding: 10px; color: #555;">✅ No hay impuestos vencidos hoy</td>
      </tr>
    `;
    } else {
        impuestos.forEach((imp) => {
            htmlContent += `
        <tr>
          <td>${imp.empresa}</td>
          <td>${imp.nombreImpuesto}</td>
          <td>${imp.nit}</td>
          <td>${imp.emailCliente}</td>
          <td>${imp.emailContador}</td>
        </tr>
      `;
        });
    }

    htmlContent += `
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 14px; color: #777;">Atentamente,</p>
        <p style="font-size: 16px; font-weight: bold; color: #333;">Cala Asociados - Contadores Públicos</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destino,
        subject: asunto,
        html: htmlContent,
    });

    console.log(`📧 Resumen enviado al superadministrador (${destino})`);
}

