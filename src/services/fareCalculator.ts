import type { GonzagaRouteFare } from '../types';

export const INITIAL_GONZAGA_BARANGAYS = [
  'Amunitan',
  'Batangan',
  'Baua',
  'Cabanbanan Norte',
  'Cabanbanan Sur',
  'Cabiraoan',
  'Cabiraoan (Abbut)',
  'Calayan',
  'Callao',
  'Caroan',
  'Casitan',
  'Flourishing',
  'Ipil',
  'Ipil (Burattok)',
  'Ipil (San Francisco)',
  'Isca',
  'Magrafil',
  'Minanga',
  'Paradise',
  'Pateng',
  'Pateng (Laoc)',
  'Progressive',
  'Rebecca',
  'San Jose',
  'Smart',
  'Sta. Clara (Zone 1&2)',
  'Sta. Clara (Zone 3,4,5, &6)',
  'Sta. Cruz',
  'Sta. Maria',
  'Tapel',
  'Tapel (Sta. Isabel)'
];

export const INITIAL_GONZAGA_FARES: GonzagaRouteFare[] = [
  { id: '1', route: 'Pateng to Poblacion (Vice Versa)', fromBarangay: 'Pateng', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 25, discountRate: 20, csuRate: 25 },
  { id: '2', route: 'Rebecca to Poblacion (Vice Versa)', fromBarangay: 'Rebecca', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 25, discountRate: 20, csuRate: 30 },
  { id: '3', route: 'Isca to Poblacion (Vice Versa)', fromBarangay: 'Isca', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 35, discountRate: 25, csuRate: 35 },
  { id: '4', route: 'Cabanbanan Sur to Poblacion (Vice Versa)', fromBarangay: 'Cabanbanan Sur', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 30, discountRate: 25, csuRate: 30 },
  { id: '5', route: 'Cabanbanan Norte to Poblacion (Vice Versa)', fromBarangay: 'Cabanbanan Norte', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 40, discountRate: 25, csuRate: 35 },
  { id: '6', route: 'Casitan to Poblacion (Vice Versa)', fromBarangay: 'Casitan', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 35, discountRate: 30, csuRate: 35 },
  { id: '7', route: 'Calayan to Poblacion (Vice Versa)', fromBarangay: 'Calayan', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 25, discountRate: 20, csuRate: 30 },
  { id: '8', route: 'Callao to Poblacion (Vice Versa)', fromBarangay: 'Callao', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 30, discountRate: 20, csuRate: 30 },
  { id: '9', route: 'Minanga to Poblacion (Vice Versa)', fromBarangay: 'Minanga', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 30, discountRate: 20, csuRate: 30 },
  { id: '10', route: 'Batangan to Poblacion (Vice Versa)', fromBarangay: 'Batangan', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 25, discountRate: 20, csuRate: 30 },
  { id: '11', route: 'Magrafil to Poblacion (Vice Versa)', fromBarangay: 'Magrafil', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 50, discountRate: 45, csuRate: 50 },
  { id: '12', route: 'Magrafil to Highway', fromBarangay: 'Magrafil', toBarangay: 'Highway', regularRate: 25, discountRate: 20, csuRate: 30 },
  { id: '13', route: 'Sta. Isabel / Tapel to Poblacion', fromBarangay: 'Sta. Isabel', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 40, discountRate: 30, csuRate: 35 },
  { id: '14', route: 'Tapel to Poblacion (Vice Versa)', fromBarangay: 'Tapel', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 30, discountRate: 25, csuRate: 30 },
  { id: '15', route: 'San Francisco / Ipil to Poblacion', fromBarangay: 'San Francisco', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 50, discountRate: 40, csuRate: 45 },
  { id: '16', route: 'Ipil to Poblacion', fromBarangay: 'Ipil', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 35, discountRate: 30, csuRate: 40 },
  { id: '17', route: 'Ipil (Burattok)', fromBarangay: 'Ipil', toBarangay: 'Burattok', regularRate: 45, discountRate: 45 },
  { id: '18', route: 'Ipil - Amunitan', fromBarangay: 'Ipil', toBarangay: 'Amunitan', regularRate: 20, discountRate: 15 },
  { id: '19', route: 'Amunitan - Poblacion', fromBarangay: 'Amunitan', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 40, discountRate: 30 },
  { id: '20', route: 'Cabiraoan (Mid)', fromBarangay: 'Cabiraoan', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 30, discountRate: 20 },
  { id: '21', route: 'Baua - Amunitan', fromBarangay: 'Baua', toBarangay: 'Amunitan', regularRate: 20, discountRate: 15 },
  { id: '22', route: 'Baua - Cabiraoan', fromBarangay: 'Baua', toBarangay: 'Cabiraoan', regularRate: 35, discountRate: 25 },
  { id: '23', route: 'Baua - Sta. Cruz', fromBarangay: 'Baua', toBarangay: 'Sta. Cruz', regularRate: 20, discountRate: 15 },
  { id: '24', route: 'Baua - San Jose', fromBarangay: 'Baua', toBarangay: 'San Jose', regularRate: 20, discountRate: 15 },
  { id: '25', route: 'Within Baua Barangay', fromBarangay: 'Baua', toBarangay: 'Baua', regularRate: 20, discountRate: 15 },
  { id: '26', route: 'Baua - Abbut (Special Arrangement)', fromBarangay: 'Baua', toBarangay: 'Abbut', regularRate: 170, discountRate: 170, isSpecialArrangement: true },
  { id: '27', route: 'Laoc (Special Arrangement)', fromBarangay: 'Laoc', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 170, discountRate: 170, isSpecialArrangement: true },
  { id: '28', route: 'Poblacion Within (Smart, Progressive, Paradise, Flourishing)', fromBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 20, discountRate: 15 },
  { id: '29', route: 'Sta. Clara (Purok 1 & 2) to Poblacion', fromBarangay: 'Sta. Clara (Purok 1 & 2)', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 35, discountRate: 30 },
  { id: '30', route: 'Sta. Clara (Purok 3, 4, 5, 6) to Poblacion', fromBarangay: 'Sta. Clara (Purok 3, 4, 5, 6)', toBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)', regularRate: 40, discountRate: 35 },
];

const POBLACION_ENTITIES = ['smart', 'progressive', 'paradise', 'flourishing', 'poblacion'];

function normalizeBrgyTokens(raw: string): string[] {
  if (!raw) return [];
  const lower = raw.toLowerCase().trim();
  const tokens: string[] = [lower];

  if (POBLACION_ENTITIES.some(p => lower.includes(p))) {
    tokens.push('poblacion');
  }

  const parenMatch = lower.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    tokens.push(parenMatch[1].trim(), parenMatch[2].trim());
  }

  if (lower.includes('sta. clara') || lower.includes('santa clara')) {
    tokens.push('sta. clara');
    if (lower.includes('1') && lower.includes('2')) {
      tokens.push('zone 1&2', 'zone 1 & 2', 'purok 1 & 2', 'purok 1');
    }
    if (lower.includes('3') || lower.includes('4') || lower.includes('5') || lower.includes('6')) {
      tokens.push('zone 3,4,5, &6', 'purok 3, 4, 5, 6', 'purok 3', 'zone 3');
    }
  }

  return tokens;
}

function matchesBarangay(routeBrgy: string, selectedBrgy: string): boolean {
  if (!routeBrgy || !selectedBrgy) return false;
  const rLower = routeBrgy.toLowerCase().trim();
  const sLower = selectedBrgy.toLowerCase().trim();

  if (rLower === sLower) return true;
  if (rLower.includes(sLower) || sLower.includes(rLower)) return true;

  const rTokens = normalizeBrgyTokens(routeBrgy);
  const sTokens = normalizeBrgyTokens(selectedBrgy);

  const rIsStaClara = rTokens.includes('sta. clara');
  const sIsStaClara = sTokens.includes('sta. clara');
  if (rIsStaClara && sIsStaClara) {
    const rHas1 = rTokens.some(t => t.includes('1'));
    const sHas1 = sTokens.some(t => t.includes('1'));
    if (rHas1 && sHas1) return true;
    const rHas3 = rTokens.some(t => t.includes('3'));
    const sHas3 = sTokens.some(t => t.includes('3'));
    if (rHas3 && sHas3) return true;
    return false;
  }

  if (rTokens.includes('poblacion') && sTokens.includes('poblacion')) {
    return true;
  }

  return rTokens.some(rt => sTokens.some(st => rt === st || rt.includes(st) || st.includes(rt)));
}

export function calculateFare(
  pickupBrgy: string,
  destBrgy: string,
  discountType: 'regular' | 'senior_student_pwd',
  fareList: GonzagaRouteFare[] = INITIAL_GONZAGA_FARES,
  fuelSurgeMultiplier: number = 1.0,
  passengersCount: number = 1
): {
  baseFare: number;
  perPassengerFare: number;
  finalFare: number;
  passengersCount: number;
  routeName: string;
  isSpecialArrangement?: boolean;
} {
  const count = Math.max(1, Number(passengersCount) || 1);

  if (!pickupBrgy || !destBrgy) {
    const unitFare = Math.round(20 * fuelSurgeMultiplier);
    return {
      baseFare: 20,
      perPassengerFare: unitFare,
      finalFare: unitFare * count,
      passengersCount: count,
      routeName: 'Local Tricycle Standard Rate'
    };
  }

  const matched = fareList.find(f => 
    (matchesBarangay(f.fromBarangay, pickupBrgy) && matchesBarangay(f.toBarangay, destBrgy)) ||
    (matchesBarangay(f.toBarangay, pickupBrgy) && matchesBarangay(f.fromBarangay, destBrgy))
  );

  const isCSUDestination = destBrgy.toLowerCase().includes('csu') || pickupBrgy.toLowerCase().includes('csu');
  
  if (matched) {
    let rate = discountType === 'senior_student_pwd' ? matched.discountRate : matched.regularRate;
    if (isCSUDestination && matched.csuRate) {
      rate = matched.csuRate;
    }
    const perPassengerFare = Math.round(rate * fuelSurgeMultiplier);
    const finalFare = matched.isSpecialArrangement ? perPassengerFare : (perPassengerFare * count);
    return {
      baseFare: rate,
      perPassengerFare,
      finalFare,
      passengersCount: count,
      routeName: matched.route,
      isSpecialArrangement: matched.isSpecialArrangement
    };
  }

  const fallback = fareList.find(f => 
    matchesBarangay(f.fromBarangay, pickupBrgy) || 
    matchesBarangay(f.fromBarangay, destBrgy) ||
    matchesBarangay(f.toBarangay, pickupBrgy) ||
    matchesBarangay(f.toBarangay, destBrgy)
  );

  if (fallback) {
    let rate = discountType === 'senior_student_pwd' ? fallback.discountRate : fallback.regularRate;
    if (isCSUDestination && fallback.csuRate) {
      rate = fallback.csuRate;
    }
    const perPassengerFare = Math.round(rate * fuelSurgeMultiplier);
    const finalFare = fallback.isSpecialArrangement ? perPassengerFare : (perPassengerFare * count);
    return {
      baseFare: rate,
      perPassengerFare,
      finalFare,
      passengersCount: count,
      routeName: `${fallback.route} (Standard)`,
      isSpecialArrangement: fallback.isSpecialArrangement
    };
  }

  const defaultRate = discountType === 'senior_student_pwd' ? 15 : 20;
  const unitFare = Math.round(defaultRate * fuelSurgeMultiplier);
  return {
    baseFare: defaultRate,
    perPassengerFare: unitFare,
    finalFare: unitFare * count,
    passengersCount: count,
    routeName: 'Gonzaga Standard Zone Rate'
  };
}

export function cleanBarangay(name?: string): string {
  if (!name) return '';
  if (name.includes('(')) {
    return name.split('(')[0].trim();
  }
  return name.trim();
}

