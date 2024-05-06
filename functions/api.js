const express = require("express");
const serverless = require("serverless-http");
const chromium = require("chrome-aws-lambda");
const bodyParser = require("body-parser");
const cors = require("cors"); // Requerir el módulo CORS
const app = express();
const router = express.Router();
const puppeteer = require("puppeteer");

app.use(cors()); // Activar CORS para todas las rutas y métodos
app.use(bodyParser.json({ limit: "250mb" }));
app.use(bodyParser.urlencoded({ limit: "250mb", extended: true }));

let records = [];

//Get all students
router.get("/", (req, res) => {
  res.send("App is running..");
});

// // Endpoint para generar PDF
router.post("/generate-pdf", async (req, res) => {
  console.log(req.body);
  // Asume que recibes HTML como parte del cuerpo de la solicitud
  const { content } = req.body;

  if (!content) {
    return res.status(400).send("No HTML content provided.");
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      headless: true,
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setContent(content, { waitUntil: "networkidle0" }); // Espera hasta que el evento 'networkidle0' se dispare
    const pdf = await page.pdf({ format: "A4", printBackground: true }); // Genera un PDF con formato A4

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf); // Envía el PDF generado como respuesta
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
});
//delete existing record
router.delete("/", (req, res) => {
  res.send("Deleted existing record");
});

//updating existing record
router.put("/", (req, res) => {
  res.send("Updating existing record");
});

//showing demo records
router.get("/demo", (req, res) => {
  res.json([
    {
      id: "001",
      name: "Smith",
      email: "smith@gmail.com",
    },
    {
      id: "002",
      name: "Sam",
      email: "sam@gmail.com",
    },
    {
      id: "003",
      name: "lily",
      email: "lily@gmail.com",
    },
  ]);
});

app.use("/.netlify/functions/api", router);
// Alternar entre entorno serverless y desarrollo local
if (process.env.NODE_ENV === "production") {
  module.exports.handler = serverless(app);
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
