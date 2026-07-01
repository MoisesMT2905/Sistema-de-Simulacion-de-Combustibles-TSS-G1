import { read, utils } from 'xlsx';
import mammoth from 'mammoth';

// Inspect Excel file
console.log('=== EXCEL FILE ===');
const workbook = read('data/Proyecto-de-Simulacin-TSS-G1-d27149.xlsx');
console.log('Sheet names:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet).slice(0, 5);
  console.log(JSON.stringify(data, null, 2));
}

// Inspect Word file
console.log('\n=== WORD FILE ===');
const docResult = await mammoth.extractRawText({ path: 'data/Informe-del-Proyecto-de-Simulacion-3ec38e.docx' });
console.log(docResult.value.slice(0, 1500));
