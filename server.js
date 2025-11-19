import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const app = express();

// Serve static files
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------------------------------------------------------------
//   ENSURE CSV FILE EXISTS
// ------------------------------------------------------------
if (!fs.existsSync("submissions.csv")) {
  fs.writeFileSync(
    "submissions.csv",
    `"Service","FullName","Email","Phone","ID","Issue","Date","Status"\n`
  );
  console.log("CSV created.");
}

// ------------------------------------------------------------
//   ZOHO MAILER
// ------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@sarkarifixo.com",
    pass: process.env.ZOHO_APP_PASS, // use your Zoho app password
  },
});

// ------------------------------------------------------------
//   UNIVERSAL SUBMISSION HANDLER
// ------------------------------------------------------------
async function handleSubmission(req, res, idFieldName, serviceName) {
  try {
    const { fullName, email, phone, issue } = req.body;
    const idValue = req.body[idFieldName] || "";
    const date = new Date().toLocaleString("en-IN");

    // Save to CSV
    const row = `"${serviceName}","${fullName}","${email}","${phone}","${idValue}","${issue}","${date}","0"\n`;

    fs.appendFileSync("submissions.csv", row);

    // Send Email
    await transporter.sendMail({
      from: "noreply@sarkarifixo.com",
      to: email,
      subject: `${serviceName} Request Received — SarkariFixo`,
      text: `Dear ${fullName},

Your ${serviceName} correction request has been received.

ID: ${idValue}
Issue: ${issue}

We will contact you soon.

Regards,  
SarkariFixo Support Team`,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Submission Error:", err);
    return res.json({ ok: false, error: "Server Error" });
  }
}

// ------------------------------------------------------------
//   OLD WORKING FORM ROUTES (RESTORED)
// ------------------------------------------------------------
app.get("/form/pan", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/pan.html"));
});
app.get("/form/aadhaar", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/aadhaar.html"));
});
app.get("/form/passport", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/passport.html"));
});
app.get("/form/voterid", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/voterid.html"));
});
app.get("/form/drivinglicense", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/driving_license.html"));
});
app.get("/form/birthcertificate", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/birth_certificate.html"));
});
app.get("/form/incomecertificate", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/income_certificate.html"));
});
app.get("/form/castecertificate", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/caste_certificate.html"));
});
app.get("/form/rationcard", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/ration_card.html"));
});
app.get("/form/ayushman", (req, res) => {
  res.sendFile(path.join(__dirname, "forms/ayushman_healthid.html"));
});

// ------------------------------------------------------------
//   SUBMISSION ROUTES
// ------------------------------------------------------------
app.post("/submit/pan", (req, res) =>
  handleSubmission(req, res, "panNumber", "PAN")
);
app.post("/submit/aadhaar", (req, res) =>
  handleSubmission(req, res, "aadhaarNumber", "Aadhaar")
);
app.post("/submit/passport", (req, res) =>
  handleSubmission(req, res, "passportNumber", "Passport")
);
app.post("/submit/voterid", (req, res) =>
  handleSubmission(req, res, "voterId", "Voter ID")
);
app.post("/submit/drivinglicense", (req, res) =>
  handleSubmission(req, res, "dlNumber", "Driving License")
);
app.post("/submit/birthcertificate", (req, res) =>
  handleSubmission(req, res, "birthNumber", "Birth Certificate")
);
app.post("/submit/incomecertificate", (req, res) =>
  handleSubmission(req, res, "incomeNumber", "Income Certificate")
);
app.post("/submit/castecertificate", (req, res) =>
  handleSubmission(req, res, "casteNumber", "Caste Certificate")
);
app.post("/submit/rationcard", (req, res) =>
  handleSubmission(req, res, "rationNumber", "Ration Card")
);
app.post("/submit/ayushman", (req, res) =>
  handleSubmission(req, res, "healthId", "Ayushman / Health ID")
);

// ------------------------------------------------------------
//   ADMIN: GET ALL SUBMISSIONS
// ------------------------------------------------------------
app.get("/api/submissions", (req, res) => {
  try {
    const csv = fs.readFileSync("submissions.csv", "utf8");
    const lines = csv.split(/\r?\n/).filter(Boolean);

    const header = lines.shift().split(",").map(h => h.replace(/"/g, ""));
    const data = lines.map(line => {
      const cols = line.match(/(".*?"|[^",\s]+)(?=,|\s*$)/g) || [];
      const obj = {};
      header.forEach((h, i) => (obj[h] = (cols[i] || "").replace(/^"|"$/g, "")));
      return obj;
    });

    res.json(data);
  } catch (err) {
    console.error("API Submissions Error:", err);
    res.status(500).json({ error: "Failed to read CSV" });
  }
});

// ------------------------------------------------------------
//   ADMIN: UPDATE STATUS
// ------------------------------------------------------------
app.post("/api/update-status", (req, res) => {
  try {
    const { rowIndex, set } = req.body;

    const csv = fs.readFileSync("submissions.csv", "utf8");
    let lines = csv.split(/\r?\n/);

    const header = lines[0];
    let rows = lines.slice(1).filter(Boolean);

    let cols = rows[rowIndex].match(/(".*?"|[^",\s]+)(?=,|\s*$)/g);
    cols[7] = `"${set ? "1" : "0"}"`;

    rows[rowIndex] = cols.join(",");

    const newCsv = header + "\n" + rows.join("\n") + "\n";
    fs.writeFileSync("submissions.csv", newCsv);

    res.json({ ok: true });
  } catch (err) {
    console.error("Status Update Error:", err);
    res.json({ ok: false });
  }
});

// ------------------------------------------------------------
//   ADMIN: DOWNLOAD CSV
// ------------------------------------------------------------
app.get("/api/download", (req, res) => {
  const file = path.join(__dirname, "submissions.csv");
  res.download(file);
});

// ------------------------------------------------------------
//   START SERVER
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
