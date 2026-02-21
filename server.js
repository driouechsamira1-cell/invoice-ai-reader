const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.post("/read-pdf", upload.single("file"), async (req, res) => {

  try {

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    /* ===== استخراج المبلغ ===== */

    const totalPatterns = [
      /Total\s*[:\-]?\s*([\d\.,]+)/i,
      /TTC\s*[:\-]?\s*([\d\.,]+)/i,
      /Net\s*à\s*payer\s*[:\-]?\s*([\d\.,]+)/i,
      /Montant\s*[:\-]?\s*([\d\.,]+)/i,
      /Amount\s*Due\s*[:\-]?\s*([\d\.,]+)/i,
      /([\d\.,]+)\s*(€|\$|MAD|DZD|SAR|AED)/i
    ];

    let total = "Not found";

    for (let pattern of totalPatterns) {
      let match = text.match(pattern);
      if (match) {
        total = match[1].replace(",", ".");
        break;
      }
    }

    /* ===== استخراج التاريخ ===== */

    const datePatterns = [
      /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/,
      /\b(\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/,
      /\b(\d{2}\s+[A-Za-z]+\s+\d{4})\b/
    ];

    let date = "Not found";

    for (let pattern of datePatterns) {
      let match = text.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }

    res.json({
      success: true,
      total: total,
      date: date,
      extractedText: text
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: "Error reading PDF"
    });

  }

});

app.get("/", (req, res) => {
  res.send("Invoice AI Reader is running 🚀");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});