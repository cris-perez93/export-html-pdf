const express = require("express");
var bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const serverless = require("serverless-http");
const router = express.Router();
const app = express();
app.use(bodyParser.json({ limit: "250mb" }));
app.use(bodyParser.urlencoded({ limit: "250mb", extended: true }));
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Cambia aquí para manejar el error de puerto en uso
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(
        `Port ${PORT} is already in use, trying with port ${PORT + 1}`
      );
      app.listen(PORT + 1);
    }
  });

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Endpoint para generar PDF
app.post("/generate-pdf", async (req, res) => {
  // Asume que recibes HTML como parte del cuerpo de la solicitud
  const { content } = req.body;

  if (!content) {
    return res.status(400).send("No HTML content provided.");
  }

  try {
    const browser = await puppeteer.launch({
      headless: true, // Puppeteer corre en modo headless por defecto
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Argumentos necesarios en ciertos entornos
    });
    const page = await browser.newPage();
    await page.setContent(content, { waitUntil: "networkidle0" }); // Espera hasta que el evento 'networkidle0' se dispare
    const pdf = await page.pdf({ format: "A4" }); // Genera un PDF con formato A4

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf); // Envía el PDF generado como respuesta
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
});
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
