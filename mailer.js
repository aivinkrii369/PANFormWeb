const nodemailer = require("nodemailer");

// Create transporter for Zoho SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",     // Zoho India server
  port: 465,                // SSL
  secure: true,             // use SSL
  auth: {
    user: "noreply@sarkarifixo.com",   // your Zoho email
    pass: "YOUR_APP_PASSWORD"          // Zoho app password
  }
});

// Test function
async function sendTestMail() {
  try {
    let info = await transporter.sendMail({
      from: '"SarkariFixo PAN" <noreply@sarkarifixo.com>', 
      to: "yourpersonal@email.com",    
      subject: "Test Acknowledgment from SarkariFixo",
      html: `<p>Dear User,</p>
             <p>This is a test email sent via Zoho SMTP + Nodemailer setup.</p>
             <p>Regards,<br>SarkariFixo Team</p>`
    });

    console.log("✅ Mail sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

sendTestMail();
