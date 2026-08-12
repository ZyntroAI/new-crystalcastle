Here’s a complete, runnable example of an `auto-generate-csv.js` script that generates a CSV file from sample data. This script can be adapted for real-world use cases (e.g., reading from an API, database, or JSON file).

### **`auto-generate-csv.js`**
```javascript
const fs = require('fs');
const path = require('path');

// Sample data (replace with your actual data source)
const sampleData = [
  { id: 1, name: "Alice", age: 30, email: "alice@example.com" },
  { id: 2, name: "Bob", age: 25, email: "bob@example.com" },
  { id: 3, name: "Charlie", age: 35, email: "charlie@example.com" },
];

// Convert data to CSV format
function generateCSV(data) {
  if (data.length === 0) return "";

  // Extract headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const rows = data.map((item) => headers.map((header) => item[header]).join(','));

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

// Write CSV to a file
function saveCSV(csvData, outputPath) {
  fs.writeFileSync(outputPath, csvData, 'utf-8');
  console.log(`CSV file generated at: ${outputPath}`);
}

// Main execution
const outputFilePath = path.join(__dirname, 'output.csv');
const csvData = generateCSV(sampleData);
saveCSV(csvData, outputFilePath);
```

---

### **How to Use This Script**
1. **Install Node.js** (if not already installed) from [nodejs.org](https://nodejs.org/).
2. Save the code above as `auto-generate-csv.js`.
3. Run it in the terminal:
   ```bash
   node auto-generate-csv.js
   ```
4. A file named `output.csv` will be created in the same directory.

---

### **Customization Options**
- **Replace `sampleData`** with your actual data (e.g., fetched from an API or database).
- **Modify the CSV structure** (e.g., add quotes for strings, handle commas in data).
- **Add error handling** (e.g., check if the file write succeeds).

Would you like any modifications or additional features (e.g., reading from a JSON file, handling large datasets)?
