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
      return res.status(400).json({ success: false, message: "No file uploaded" });
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

    lines.forEach(line => {

      const parts = line.split(/\s+/);

      if (parts.length >= 4) {

        const cleanPrice = parts[parts.length - 3].replace(/[^\d.]/g, "");
        const cleanQty = parts[parts.length - 2].replace(/[^\d]/g, "");
        const cleanTotal = parts[parts.length - 1].replace(/[^\d.]/g, "");

        const price = parseFloat(cleanPrice);
        const quantity = parseInt(cleanQty);
        const total = parseFloat(cleanTotal);

        if (!isNaN(price) && !isNaN(quantity) && !isNaN(total)) {

          const name = parts.slice(0, parts.length - 3).join(" ");

          // تجنب إضافة رأس الجدول مثل Produit Prix Quantité Total
          if (
            name.toLowerCase().includes("produit") ||
            name.toLowerCase().includes("price") ||
            name.toLowerCase().includes("total")
          ) {
            return;
          }

          products.push({
            name: name,
            price: price,
            quantity: quantity
          });
        }
      }
    });

    // استخراج التاريخ (عدة صيغ)
    let date = "Not found";

    const isoDate = text.match(/\d{4}-\d{2}-\d{2}/);
    const frDate = text.match(/\d{1,2}\s\w+\s\d{4}/);

    if (isoDate) date = isoDate[0];
    else if (frDate) date = frDate[0];

    res.json({
      success: true,
      date,
      products
    });

  } catch (error) {
    console.error("ERROR:", error);
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