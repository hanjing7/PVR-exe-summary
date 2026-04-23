/**
 * Fetches simplified US states GeoJSON and pre-projects each polygon
 * into the existing equirectangular coordinate space (520×280).
 * Outputs a JS array literal that can be pasted directly into buildDetailMap().
 */
const https = require('https');

const W = 520, H = 280;
const minLng = -124, maxLng = -66, minLat = 24, maxLat = 50;

function proj(lat, lng) {
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H
  };
}

function ringToD(ring) {
  return ring.map((c, i) => {
    const p = proj(c[1], c[0]);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join('') + 'Z';
}

function featureToD(feature) {
  const g = feature.geometry;
  const parts = [];
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  polys.forEach(poly => poly.forEach(ring => parts.push(ringToD(ring))));
  return parts.join('');
}

// Filter to continental US only (exclude AK lat>54 and HI lng<-140)
function isContinental(feature) {
  const name = feature.properties.NAME || feature.properties.name || '';
  return name !== 'Alaska' && name !== 'Hawaii' &&
         name !== 'Puerto Rico' && name !== 'United States Virgin Islands' &&
         name !== 'Guam' && name !== 'American Samoa' &&
         name !== 'Commonwealth of the Northern Mariana Islands';
}

const url = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

https.get(url, res => {
  let raw = '';
  res.on('data', c => raw += c);
  res.on('end', () => {
    const gj = JSON.parse(raw);
    const paths = gj.features
      .filter(isContinental)
      .map(f => featureToD(f));

    // Output one giant joined path string (all states combined — lighter than array)
    const combined = paths.join(' ');
    console.log('// US_STATES_PATH — paste into buildDetailMap()');
    console.log(`const US_STATES_D = "${combined}";`);
    console.log(`\n// character count: ${combined.length}`);
  });
}).on('error', e => { console.error(e); process.exit(1); });

