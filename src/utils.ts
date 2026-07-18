/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Formatter for Indonesian Rupiah (IDR)
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Convert data list to a CSV string and trigger download
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headersMap: Record<keyof T | string, string>
) {
  if (data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const headers = Object.keys(headersMap) as Array<keyof T>;
  const csvHeaders = Object.values(headersMap).join(",");
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      let val: any = row[header];
      if (val === undefined || val === null) {
        val = "";
      } else if (typeof val === "string") {
        // Escape quotes
        val = `"${val.replace(/"/g, '""')}"`;
      } else if (typeof val === "object") {
        val = `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [csvHeaders, ...csvRows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Simple parser for CSV string to array of objects
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/);
  return lines
    .map(line => {
      // Split by comma, taking into account quotes
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    })
    .filter(row => row.length > 0 && row.some(cell => cell !== ""));
}
