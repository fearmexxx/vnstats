const Database = require('better-sqlite3');
const db = new Database('data.db');

const updates = {
  'VPS': 'Công ty Cổ phần Chứng khoán VPS',
  'SSI': 'Công ty Cổ phần Chứng khoán SSI',
  'TCBS': 'Công ty Cổ phần Chứng khoán Kỹ thương',
  'VCI': 'Công ty Cổ phần Chứng khoán Vietcap',
  'HSC': 'Công ty Cổ phần Chứng khoán Thành phố Hồ Chí Minh',
  'MBS': 'Công ty Cổ phần Chứng khoán MB',
  'VND': 'Công ty Cổ phần Chứng khoán VNDIRECT',
  'KIS': 'Công ty Cổ phần Chứng khoán KIS Việt Nam',
  'VPBANKS': 'Công ty Cổ phần Chứng khoán VPBank',
  'VCBS': 'Công ty TNHH Chứng khoán Ngân hàng TMCP Ngoại thương Việt Nam',
  'MAS': 'Công ty Cổ phần Chứng khoán Mirae Asset (Việt Nam)',
  'FPTS': 'Công ty Cổ phần Chứng khoán FPT',
  'DNSE': 'Công ty Cổ phần Chứng khoán DNSE',
  'BSC': 'Công ty Cổ phần Chứng khoán Ngân hàng Đầu tư và Phát triển Việt Nam',
  'ACBS': 'Công ty TNHH Chứng khoán ACB'
};

const stmt = db.prepare('UPDATE firms SET full_name = ? WHERE id = ?');

for (const [id, name] of Object.entries(updates)) {
  stmt.run(name, id);
}

console.log('Firm names updated to official legal titles.');
