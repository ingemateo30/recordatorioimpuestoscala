import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const PRIMARY_COLOR = "#1aa758";
const SECONDARY_COLOR = "#F3F6FC";
const ACCENT_COLOR = "#E74C3C";



export async function enviarCorreoCliente(destino: string, impuesto: any) {

 console.log(`📤 Intentando enviar a ${impuesto.emailCliente}...`);
  const fechaFormateada = new Date(impuesto.fechaVencimiento).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"Cala Asociados" <${process.env.EMAIL_USER}>`,
    to: destino,
    subject: "🔔 Recordatorio: Vencimiento de Impuesto Mañana",
    attachments: [{
      filename: 'cala.png',
      path: './public/cala.png',
      cid: 'company-logo'
    }],
    html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Impuesto</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: ${PRIMARY_COLOR}; padding: 25px 0; text-align: center;">
              <!-- Usar la imagen como archivo adjunto con cid: -->
              <img src="cid:company-logo" alt="Cala Asociados" style="max-width: 180px; height: auto;">
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 25px;">
              <h2 style="color: ${PRIMARY_COLOR}; margin-top: 0; font-size: 22px; text-align: center;">Recordatorio de Vencimiento Tributario</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Estimado(a) cliente,</p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Le informamos que <strong>mañana vence</strong> el siguiente impuesto:</p>
              
              <div style="background-color: ${SECONDARY_COLOR}; border-left: 4px solid ${PRIMARY_COLOR}; padding: 20px; margin: 20px 0; border-radius: 6px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 8px 0; color: #555; width: 40%;">Empresa:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${impuesto.empresa}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">NIT:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${impuesto.nit}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">Impuesto:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${impuesto.nombreImpuesto}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">Vencimiento:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: ${ACCENT_COLOR};">${fechaFormateada}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Por favor, asegúrese de realizar el pago oportuno para evitar recargos, intereses y sanciones tributarias.</p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: ${SECONDARY_COLOR}; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="font-weight: bold; color: ${PRIMARY_COLOR}; margin-bottom: 8px; font-size: 16px;">Cala Asociados - Contadores Públicos</p>
              <p style="color: #666; font-size: 14px; margin: 8px 0;">
                <span style="margin-right: 12px;">📍 Calle 10 # 12 - 184 Centro comercial El Puente</span>
                <span>Torre empresarial, local 506</span>
              </p>
              <p style="color: #666; font-size: 14px; margin: 8px 0;">
                <span style="margin-right: 12px;">📞 +57 3153754395</span>
                <span>✉️ contabilidad@calaasociados.com </span>
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 15px; font-size: 12px; color: #999;">
            <p>Este correo fue enviado automáticamente. Por favor no responda a este mensaje.</p>
          </div>
        </body>
        </html>
        `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Correo enviado a ${destino}`);
}


export async function enviarCorreoAdmin(destino: string, asunto: string, impuestos: any[]) {

  const hoy = new Date();
const manana = new Date(hoy);
manana.setDate(hoy.getDate() + 1);
  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const fechaManana = manana.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


  const mailOptions = {
    from: `"Sistema Cala Asociados"`,
    to: destino,
    subject: asunto,
    bcc: 'mateo.s3009@gmail.com , johana@calaasociados.com , mayra@calaasociados.com , nancy@calaasociados.com , meortizz96@gmail.com , sjulianac15@gmail.com , dm25814@gmail.com  ',
    attachments: [{
      filename: 'cala.png',
      path: './public/cala.png',
      cid: 'company-logo'
    }],
    html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reporte de Vencimientos</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
          <div style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style=" padding: 25px 0; text-align: center;">
              <!-- Usar la imagen como archivo adjunto con cid: -->
              <img src="cid:company-logo" alt="Cala Asociados" style="max-width: 180px; height: auto;">
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 25px;">
              <h2 style="color: ${PRIMARY_COLOR}; margin-top: 0; font-size: 22px; text-align: center;">Reporte de Impuestos con Vencimiento Mañana</h2>
              <p style="color: #555; text-align: center; margin-bottom: 25px;">Fecha del reporte: ${fechaHoy}</p>
              
        `
  };

  if (impuestos.length === 0) {
    mailOptions.html += `
          <div style="background-color: #e6f7e6; border-left: 4px solid #2ecc71; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #27ae60; font-size: 16px; font-weight: 500; text-align: center;">✅ No hay impuestos con vencimiento para ${fechaManana}</p>
          </div>
        `;
  } else {
    mailOptions.html += `
          <div style="background-color: ${SECONDARY_COLOR}; border-left: 4px solid ${PRIMARY_COLOR}; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p style="color: ${PRIMARY_COLOR}; font-weight: 500; margin-top: 0;">Se han identificado <strong>${impuestos.length}</strong> impuestos con vencimiento para ${fechaManana}:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background-color: ${PRIMARY_COLOR}; color: white;">
                  <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">Empresa</th>
                  <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">Impuesto</th>
                  <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">NIT</th>
                </tr>
              </thead>
              <tbody>
        `;

    impuestos.forEach((imp, index) => {
      const rowColor = index % 2 === 0 ? '#f9f9f9' : 'white';
      mailOptions.html += `
                <tr style="background-color: ${rowColor};">
                  <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${imp.empresa}</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${imp.nombreImpuesto}</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${imp.nit}</td>
                </tr>
            `;
    });

    mailOptions.html += `
              </tbody>
            </table>
          </div>
        `;

    mailOptions.html += `
          <div style="margin-top: 25px; text-align: center;">
          </div>
        `;
  }
  mailOptions.html += `
            </div>
            <!-- Footer -->
            <div style="background-color: ${SECONDARY_COLOR}; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="font-weight: bold; color: ${PRIMARY_COLOR}; margin-bottom: 8px; font-size: 16px;">Cala Asociados - Contadores Públicos</p>
              <p style="color: #666; font-size: 14px; margin: 8px 0;">
                <span style="margin-right: 12px;">📍 Calle 10 # 12 - 184 Centro comercial El Puente</span>
                <span>Torre empresarial, local 506</span>
              </p>
              <p style="color: #666; font-size: 14px; margin: 8px 0;">
                <span style="margin-right: 12px;">📞 +57 3153754395</span>
                <span>✉️ contabilidad@calaasociados.com </span>
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 15px; font-size: 12px; color: #999;">
            <p>Este es un correo automático generado por el sistema. Por favor no responda a este mensaje.</p>
          </div>
        </body>
        </html>
        `
  await transporter.sendMail(mailOptions);
  console.log(`📧 Resumen enviado al superadministrador (${destino})`);
};

