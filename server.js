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
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    let total = "Not found";
    const amountMatches = text.match(/\d+(?:[.,]\d{2})/g);

    if (amountMatches && amountMatches.length > 0) {
      let numbers = amountMatches.map(n =>
        parseFloat(n.replace(",", "."))
      );
      total = Math.max(...numbers).toFixed(2);
    }

    let date = "Not found";
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      date = dateMatch[0];
    }

    let products = [];
    const lines = text.split("\n");

    lines.forEach(line => {
      const match = line.match(/^(.+?)\s+(\d+)\s+(\d+[.,]\d{2})$/);
      if (match) {
        products.push({
          name: match[1].trim(),
          quantity: parseInt(match[2]),
          price: parseFloat(match[3].replace(",", "."))
        });
      }
    });

    res.json({
      success: true,
      total,
      date,
      products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Invoice AI Reader is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});