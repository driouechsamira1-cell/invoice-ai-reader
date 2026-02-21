app.post("/read-pdf", upload.single("file"), async (req, res) => {

  try {

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    /* ===== استخراج المبلغ ===== */

    let total = "Not found";
    const amountMatches = text.match(/\d{1,3}([.,]\d{3})*([.,]\d{2})/g);

    if (amountMatches && amountMatches.length > 0) {
      let numbers = amountMatches.map(num =>
        parseFloat(num.replace(/\./g, '').replace(',', '.'))
      );
      total = Math.max(...numbers).toFixed(2);
    }

    /* ===== استخراج التاريخ ===== */

    let date = "Not found";
    const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dateMatch) date = dateMatch[1];

    /* ===== استخراج المنتجات ===== */

    let products = [];
    const lines = text.split("\n");

    lines.forEach(line => {

      // نبحث عن سطر يحتوي اسم + رقم + رقم
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

    res.status(500).json({
      success: false,
      error: "Error reading PDF"
    });

  }

});