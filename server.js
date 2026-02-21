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
    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    console.log("===== PDF TEXT =====");
    console.log(text);

    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);

    let products = [];

    // ابحث عن الأسطر التي تحتوي رقمين (سعر وكمية)
    lines.forEach(line => {

      // مثال: Laptop 12 1 12
      const parts = line.split(/\s+/);

      if (parts.length >= 4) {

        const possiblePrice = parseFloat(parts[parts.length - 3]);
        const possibleQty = parseInt(parts[parts.length - 2]);
        const possibleTotal = parseFloat(parts[parts.length - 1]);

        if (!isNaN(possiblePrice) && !isNaN(possibleQty) && !isNaN(possibleTotal)) {

          const name = parts.slice(0, parts.length - 3).join(" ");

          products.push({
            name: name,
            price: possiblePrice,
            quantity: possibleQty
          });
        }
      }

    });

    // استخراج التاريخ
    let date = "Not found";

    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      date = dateMatch[0];
    }

    res.json({
      success: true,
      date,
      products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.get("/", (req, res) => {
  res.send("Invoice AI Reader is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});