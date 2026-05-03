const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'So luong tai khoan nha dau tu den cuoi thang 03 nam 2026_1776307669353.xlsx';
const OUTPUT_FILE = 'src/data/market-accounts.json';

function parseExcel() {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON, skip header rows (first 5 rows are headers/meta)
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Data starts from index 6 (row 7 in excel) based on my previous head() check
  // Index 5 was headers: Thời gian, Trong nước, ... Tổng cộng
  const rows = data.slice(6);
  
  const history = rows.map((row, index) => {
    const date = row[0];
    const total = row[5]; // Tổng cộng is index 5
    
    // Convert dot-separated string to number if needed
    const totalNum = typeof total === 'string' ? parseInt(total.replace(/\./g, '')) : total;
    
    return {
      date,
      total: totalNum
    };
  }).filter(r => r.date && r.total);

  // Calculate monthly new accounts
  const processedHistory = history.map((curr, idx) => {
    if (idx === 0) return { ...curr, newAccounts: 0 };
    const prev = history[idx - 1];
    return {
      ...curr,
      newAccounts: curr.total - prev.total
    };
  });

  const latest = processedHistory[processedHistory.length - 1];

  const result = {
    lastUpdated: latest.date,
    latestTotal: latest.total,
    latestNewAccounts: latest.newAccounts,
    history: processedHistory
  };

  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Successfully parsed Excel and saved to ${OUTPUT_FILE}`);
}

parseExcel();
