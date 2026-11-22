/* ConvertX conversion engine. Linear units: [label, symbol, factor-to-base-unit]. */
const CATEGORIES = {
  length:{name:'Length',icon:'📏',units:{meter:['Meter','m',1],kilometer:['Kilometer','km',1000],centimeter:['Centimeter','cm',0.01],millimeter:['Millimeter','mm',0.001],mile:['Mile','mi',1609.344],yard:['Yard','yd',0.9144],foot:['Foot','ft',0.3048],inch:['Inch','in',0.0254]}},
  weight:{name:'Weight',icon:'⚖️',units:{kilogram:['Kilogram','kg',1],gram:['Gram','g',0.001],milligram:['Milligram','mg',1e-6],pound:['Pound','lb',0.45359237],ounce:['Ounce','oz',0.028349523125],tonne:['Metric Ton','t',1000]}},
  temperature:{name:'Temperature',icon:'🌡️',allowNegative:true,units:{celsius:['Celsius','°C'],fahrenheit:['Fahrenheit','°F'],kelvin:['Kelvin','K']}},
  area:{name:'Area',icon:'⬛',units:{sqm:['Square Meter','m²',1],sqkm:['Square Kilometer','km²',1e6],sqft:['Square Foot','ft²',0.09290304],sqin:['Square Inch','in²',0.00064516],acre:['Acre','ac',4046.8564224],hectare:['Hectare','ha',10000]}},
  volume:{name:'Volume',icon:'🧪',units:{liter:['Liter','L',1],milliliter:['Milliliter','mL',0.001],cubicmeter:['Cubic Meter','m³',1000],gallon:['Gallon (US)','gal',3.785411784],cup:['Cup (US)','cup',0.2365882365],pint:['Pint (US)','pt',0.473176473]}},
  speed:{name:'Speed',icon:'🚀',units:{mps:['Meter/Second','m/s',1],kmh:['Kilometer/Hour','km/h',1/3.6],mph:['Mile/Hour','mph',0.44704],knot:['Knot','kn',1852/3600]}},
  time:{name:'Time',icon:'⏱️',units:{second:['Second','s',1],minute:['Minute','min',60],hour:['Hour','h',3600],day:['Day','d',86400],week:['Week','wk',604800],month:['Month (avg)','mo',2629746],year:['Year (avg)','yr',31556952]}},
  data:{name:'Data Storage',icon:'💾',units:{bit:['Bit','b',1],byte:['Byte','B',8],kb:['Kilobyte','KB',8192],mb:['Megabyte','MB',8388608],gb:['Gigabyte','GB',8589934592],tb:['Terabyte','TB',8796093022208]}},
  pressure:{name:'Pressure',icon:'🎚️',units:{pascal:['Pascal','Pa',1],kilopascal:['Kilopascal','kPa',1000],bar:['Bar','bar',1e5],psi:['PSI','psi',6894.757293168],atm:['Atmosphere','atm',101325]}},
  energy:{name:'Energy',icon:'⚡',units:{joule:['Joule','J',1],kilojoule:['Kilojoule','kJ',1000],calorie:['Calorie','cal',4.184],kilocalorie:['Kilocalorie','kcal',4184],kwh:['Kilowatt-hour','kWh',3.6e6]}},
  power:{name:'Power',icon:'🔌',units:{watt:['Watt','W',1],kilowatt:['Kilowatt','kW',1000],megawatt:['Megawatt','MW',1e6],horsepower:['Horsepower','hp',745.69987158227]}},
  angle:{name:'Angle',icon:'📐',allowNegative:true,units:{degree:['Degree','°',1],radian:['Radian','rad',180/Math.PI],gradian:['Gradian','grad',0.9]}}
};

const T_TO_K   = {celsius:v=>v+273.15, fahrenheit:v=>(v-32)*5/9+273.15, kelvin:v=>v};
const T_FROM_K = {celsius:k=>k-273.15, fahrenheit:k=>(k-273.15)*9/5+32, kelvin:k=>k};
const T_FORMULA = {
  'celsius>fahrenheit':'°F = (°C × 9/5) + 32', 'celsius>kelvin':'K = °C + 273.15',
  'fahrenheit>celsius':'°C = (°F − 32) × 5/9', 'fahrenheit>kelvin':'K = (°F − 32) × 5/9 + 273.15',
  'kelvin>celsius':'°C = K − 273.15',          'kelvin>fahrenheit':'°F = (K − 273.15) × 9/5 + 32'
};

/** Format a number with at most p decimals (trailing zeros removed); exponent form for tiny/huge values. */
function fmt(n, p) {
  if (!isFinite(n)) return '—';
  n = Number(n.toPrecision(15));                 // strips binary floating-point noise
  if (n === 0) return '0';
  if (Math.abs(n) >= 1e15) return n.toExponential(Math.min(p, 10));
  let s = n.toFixed(p);
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  if (Number(s) === 0) s = n.toExponential(Math.min(Math.max(p, 2), 10));
  return s;
}

/** Validate raw input text. Returns {empty}, {error} or {value}. */
function parseInput(s, cat, from) {
  s = s.trim();
  if (s === '') return {empty: true};
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return {error: 'Enter a valid number, such as 12.5 or -3.'};
  const v = Number(s);
  if (!isFinite(v)) return {error: 'That number is too large.'};
  if (v < 0 && !CATEGORIES[cat].allowNegative) return {error: `Negative values are not valid for ${CATEGORIES[cat].name}.`};
  if (cat === 'temperature' && T_TO_K[from](v) < -1e-9) return {error: 'That is below absolute zero, which is not physically possible.'};
  return {value: v};
}

/** Convert v and describe how: {result, text, formula, steps[]}. */
function convert(catKey, from, to, v, p) {
  const c = CATEGORIES[catKey], f = c.units[from], t = c.units[to];
  let result, formula, steps;
  if (catKey === 'temperature') {
    const k = T_TO_K[from](v); result = T_FROM_K[to](k);
    formula = from === to ? `${t[1]} = ${f[1]}` : T_FORMULA[from + '>' + to];
    steps = [`Start with ${fmt(v,p)} ${f[1]}`, `Convert to Kelvin: ${fmt(k,p)} K`, `Convert to ${t[0]}: ${fmt(result,p)} ${t[1]}`];
  } else {
    const b = Object.values(c.units).find(u => u[2] === 1), ratio = f[2] / t[2], base = v * f[2];
    result = v * ratio;
    formula = `${t[1]} = ${f[1]} × ${fmt(ratio,12)}`;
    steps = [`To base unit (${b[0]}): ${fmt(v,p)} ${f[1]} × ${fmt(f[2],12)} = ${fmt(base,p)} ${b[1]}`,
             `To ${t[0]}: ${fmt(base,p)} ${b[1]} ÷ ${fmt(t[2],12)} = ${fmt(result,p)} ${t[1]}`];
  }
  return {result, text: fmt(result, p), formula, steps};
}

if (typeof module !== 'undefined') module.exports = {CATEGORIES, convert, fmt, parseInput};
