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
  
  let percentReplaced = totalToReplace > 0 ? (totalReplaced / totalToReplace) * 100 : 0;
  if (percentReplaced > 100) percentReplaced = 100;

  const latitude = parseFloat(row['Latitude']) || null;
  const longitude = parseFloat(row['Longitude']) || null;

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
    exceedance: (row['Most Recent Lead Action Level Exceedance'] || '').trim(),
    latitude: latitude,
    longitude: longitude,
    epaLink: (row['EPA_Link'] || '').trim(),
  };
}).filter(row => row.pwsid);

const output = 'export const waterSystemsData = ' + JSON.stringify(jsData, null, 2) + ';\n\nexport default waterSystemsData;';

fs.writeFileSync('src/data/waterSystemsData.js', output);
console.log('✓ Converted ' + jsData.length + ' systems');

const withCoords = jsData.filter(s => s.latitude && s.longitude);
console.log('✓ ' + withCoords.length + ' systems have coordinates for mapping');
