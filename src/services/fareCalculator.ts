import type { GonzagaRouteFare } from '../types';

export const INITIAL_GONZAGA_BARANGAYS = [
  'Poblacion (Smart, Progressive, Paradise, Flourishing)',
  'Pateng',
  'Rebecca',
  'Isca',
  'Cabanbanan Sur',
  'Cabanbanan Norte',
  'Casitan',
  'Calayan',
  'Callao',
  'Minanga',
  'Batangan',
  'Magrafil',
  'Sta. Isabel',
  'Tapel',
  'San Francisco',
  'Ipil',
  'Amunitan',
  'Cabiraoan',
  'Baua',
  'Sta. Cruz',
  'San Jose',
  'Sta. Clara (Purok 1 & 2)',
  'Sta. Clara (Purok 3, 4, 5, 6)',
  'CSU Gonzaga Campus',
  'Laoc',
  'Abbut'
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

export function calculateFare(
  pickupBrgy: string,
  destBrgy: string,
  discountType: 'regular' | 'senior_student_pwd',
  fareList: GonzagaRouteFare[] = INITIAL_GONZAGA_FARES,
  fuelSurgeMultiplier: number = 1.0
): { baseFare: number; finalFare: number; routeName: string } {
  if (!pickupBrgy || !destBrgy) {
    return { baseFare: 20, finalFare: Math.round(20 * fuelSurgeMultiplier), routeName: 'Local Tricycle Standard Rate' };
  }

  const matched = fareList.find(f => 
    (f.fromBarangay.toLowerCase().includes(pickupBrgy.toLowerCase()) && f.toBarangay.toLowerCase().includes(destBrgy.toLowerCase())) ||
    (f.toBarangay.toLowerCase().includes(pickupBrgy.toLowerCase()) && f.fromBarangay.toLowerCase().includes(destBrgy.toLowerCase()))
  );

  const isCSUDestination = destBrgy.toLowerCase().includes('csu') || pickupBrgy.toLowerCase().includes('csu');
  
  if (matched) {
    let rate = discountType === 'senior_student_pwd' ? matched.discountRate : matched.regularRate;
    if (isCSUDestination && matched.csuRate) {
      rate = matched.csuRate;
    }
    const finalFare = Math.round(rate * fuelSurgeMultiplier);
    return { baseFare: rate, finalFare, routeName: matched.route };
  }

  const fallback = fareList.find(f => 
    f.fromBarangay.toLowerCase().includes(pickupBrgy.toLowerCase()) || 
    f.fromBarangay.toLowerCase().includes(destBrgy.toLowerCase())
  );

  if (fallback) {
    let rate = discountType === 'senior_student_pwd' ? fallback.discountRate : fallback.regularRate;
    if (isCSUDestination && fallback.csuRate) {
      rate = fallback.csuRate;
    }
    const finalFare = Math.round(rate * fuelSurgeMultiplier);
    return { baseFare: rate, finalFare, routeName: `${fallback.route} (Standard)` };
  }

  const defaultRate = discountType === 'senior_student_pwd' ? 15 : 20;
  return { baseFare: defaultRate, finalFare: Math.round(defaultRate * fuelSurgeMultiplier), routeName: 'Gonzaga Standard Zone Rate' };
}

export function cleanBarangay(name?: string): string {
  if (!name) return '';
  if (name.toLowerCase().includes('poblacion')) return 'Poblacion';
  if (name.toLowerCase().includes('csu')) return 'CSU Gonzaga';
  if (name.toLowerCase().includes('sta. clara')) return 'Sta. Clara';
  if (name.includes('(')) {
    return name.split('(')[0].trim();
  }
  return name.trim();
}

