# Research PDFs

Drop your research report PDFs in this folder.

**To publish a report:**

1. Copy the PDF here, e.g. `public/research/my-report.pdf`
2. Add an entry to [`/data/research-data.js`](../../data/research-data.js):

   ```js
   {
     id: "my-report",
     title: "My Report Title",
     category: "Equity",
     date: "2026-06-19",
     summary: "One-line description shown on the card.",
     file: "/research/my-report.pdf", // note: path is relative to /public
   }
   ```

The Research Library on the homepage updates automatically — newest first.
