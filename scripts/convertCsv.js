const fs = require('fs');
const Papa = require('papaparse');

const csvFile = fs.readFileSync('lead-data.csv', 'utf8');
const parsed = Papa.parse(csvFile, { 
  header: true, 
  skipEmptyLines: true,
  transformHeader: h => h.trim()
});

const jsData = parsed.data.map(row => {
  const clean = (val) => {
    if (!val || val === '-' || val === '-   ') return 0;
    const num = parseFloat(String(val).replace(/[,"\s]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const leadLines = clean(row['Lead in CDSMI']);
  const gpcl = clean(row['GPCL in CDSMI']);
  const unknown = clean(row['Unknown in CDSMI']);
  const totalToReplace = leadLines + gpcl + unknown;
  const totalReplaced = clean(row['Grand Total of Lead Service Lines Replaced']);
  
  // Read percentage directly from CSV if it exists, otherwise calculate it
  let percentReplaced = clean(row['% Replaced to Date']);
  
  // If percentage not in CSV, calculate it
  if (percentReplaced === 0 && totalToReplace > 0 && totalReplaced > 0) {
    percentReplaced = (totalReplaced / totalToReplace) * 100;
    if (percentReplaced > 100) percentReplaced = 100;
  }

  return {
    pwsid: (row['PWSID'] || '').trim(),
    name: (row['Supply Name'] || '').trim(),
    population: clean(row['Population Served (2025)']),
    leadLines: leadLines,
    gpcl: gpcl,
    unknown: unknown,
    totalToReplace: totalToReplace,
    totalReplaced: totalReplaced,
    percentReplaced: percentReplaced,
    exceedance: (row['Most Recent Lead Action Level Exceedance'] || '').trim()
  };
}).filter(row => row.pwsid);

const output = 'export const waterSystemsData = ' + JSON.stringify(jsData, null, 2) + ';\n\nexport default waterSystemsData;';

fs.writeFileSync('src/data/waterSystemsData.js', output);
console.log('Done! ' + jsData.length + ' systems');