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

    const totalMatch = text.match(/Total\s*[:\-]?\s*([\d.,]+)/i);
    const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);

    res.json({
      success: true,
      extractedText: text,
      total: totalMatch ? totalMatch[1] : "Not found",
      date: dateMatch ? dateMatch[0] : "Not found"
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running"));