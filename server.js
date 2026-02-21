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

    const lines = text.split("\n").map(l => l.trim()).filter(l => l);

    let products = [];

    for (let i = 0; i < lines.length - 3; i++) {

      let name = lines[i];
      let price = parseFloat(lines[i+1]);
      let quantity = parseInt(lines[i+2]);
      let total = parseFloat(lines[i+3]);

      if (!isNaN(price) && !isNaN(quantity) && !isNaN(total)) {

        products.push({
          name: name,
          price: price,
          quantity: quantity
        });

        i += 3;
      }
    }

    // استخراج التاريخ
    let date = "Not found";
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) date = dateMatch[0];

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
app.listen(PORT);