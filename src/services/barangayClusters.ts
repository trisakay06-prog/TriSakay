export type BarangayClusterNumber = 1 | 2 | 3 | 4 | 5;

export interface BarangayCluster {
  number: BarangayClusterNumber;
  name: `Cluster ${BarangayClusterNumber}`;
  colorName: 'Red' | 'Green' | 'Blue' | 'Yellow' | 'Orange';
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  barangays: readonly string[];
}

export const BARANGAY_CLUSTERS: readonly BarangayCluster[] = [
  {
    number: 1,
    name: 'Cluster 1',
    colorName: 'Red',
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    textColor: '#b91c1c',
    barangays: ['Flourishing', 'Flourishing (CSU)', 'Paradise', 'Progressive', 'Smart', 'Sta. Clara']
  },
  {
    number: 2,
    name: 'Cluster 2',
    colorName: 'Green',
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    textColor: '#15803d',
    barangays: ['Callao', 'Minanga']
  },
  {
    number: 3,
    name: 'Cluster 3',
    colorName: 'Blue',
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    textColor: '#1d4ed8',
    barangays: ['Amunitan', 'Batangan', 'Calayan', 'Ipil', 'Magrafil', 'Sta. Isabel', 'Tapel']
  },
  {
    number: 4,
    name: 'Cluster 4',
    colorName: 'Yellow',
    backgroundColor: '#fefce8',
    borderColor: '#eab308',
    textColor: '#854d0e',
    barangays: ['Cabanbanan Norte', 'Cabanbanan Sur', 'Caroan', 'Casitan', 'Isca', 'Pateng', 'Rebecca']
  },
  {
    number: 5,
    name: 'Cluster 5',
    colorName: 'Orange',
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
    textColor: '#c2410c',
    barangays: ['Baua', 'Cabiraoan', 'San Jose', 'Sta. Cruz', 'Sta. Maria']
  }
];

export const REGISTRATION_BARANGAYS = BARANGAY_CLUSTERS
  .flatMap(cluster => cluster.barangays)
  .sort((first, second) => first.localeCompare(second));

const CLUSTER_BY_BARANGAY = new Map(
  BARANGAY_CLUSTERS.flatMap(cluster =>
    cluster.barangays.map(barangay => [barangay.toLocaleLowerCase(), cluster] as const)
  )
);

export function getBarangayCluster(barangay: string): BarangayCluster | undefined {
  if (!barangay) return undefined;
  const clean = barangay.trim().toLocaleLowerCase();
  if (clean.includes('poblacion') || clean.includes('smart') || clean.includes('progressive') || clean.includes('paradise') || clean.includes('flourishing')) {
    return BARANGAY_CLUSTERS[0];
  }
  return CLUSTER_BY_BARANGAY.get(clean);
}

export function getClusterInfo(num?: number | BarangayClusterNumber): BarangayCluster | undefined {
  if (num === undefined || num === null) return undefined;
  return BARANGAY_CLUSTERS.find(c => c.number === Number(num));
}


export interface BarangayTodaInfo {
  name: string;
  barangay: string;
  cluster: BarangayClusterNumber;
}

export const BARANGAY_TODAS: readonly BarangayTodaInfo[] = [
  { name: 'Amunitan TODA', barangay: 'Amunitan', cluster: 3 },
  { name: 'Batangan TODA', barangay: 'Batangan', cluster: 3 },
  { name: 'Baua TODA', barangay: 'Baua', cluster: 5 },
  { name: 'Cabanbanan Norte TODA', barangay: 'Cabanbanan Norte', cluster: 4 },
  { name: 'Cabanbanan Sur TODA', barangay: 'Cabanbanan Sur', cluster: 4 },
  { name: 'Cabiraoan TODA', barangay: 'Cabiraoan', cluster: 5 },
  { name: 'Calayan TODA', barangay: 'Calayan', cluster: 3 },
  { name: 'Callao TODA', barangay: 'Callao', cluster: 2 },
  { name: 'Caroan TODA', barangay: 'Caroan', cluster: 4 },
  { name: 'Casitan TODA', barangay: 'Casitan', cluster: 4 },
  { name: 'Flourishing TODA', barangay: 'Flourishing', cluster: 1 },
  { name: 'Ipil TODA', barangay: 'Ipil', cluster: 3 },
  { name: 'Isca TODA', barangay: 'Isca', cluster: 4 },
  { name: 'Magrafil TODA', barangay: 'Magrafil', cluster: 3 },
  { name: 'Minanga TODA', barangay: 'Minanga', cluster: 2 },
  { name: 'Paradise TODA', barangay: 'Paradise', cluster: 1 },
  { name: 'Pateng TODA', barangay: 'Pateng', cluster: 4 },
  { name: 'Progressive TODA', barangay: 'Progressive', cluster: 1 },
  { name: 'Rebecca TODA', barangay: 'Rebecca', cluster: 4 },
  { name: 'San Jose TODA', barangay: 'San Jose', cluster: 5 },
  { name: 'Smart TODA', barangay: 'Smart', cluster: 1 },
  { name: 'Sta. Clara TODA', barangay: 'Sta. Clara', cluster: 1 },
  { name: 'Sta. Cruz TODA', barangay: 'Sta. Cruz', cluster: 5 },
  { name: 'Sta. Maria TODA', barangay: 'Sta. Maria', cluster: 5 },
  { name: 'Tapel TODA', barangay: 'Tapel', cluster: 3 },
];

export function findTodaByName(todaName?: string): BarangayTodaInfo | undefined {
  if (!todaName) return undefined;
  const lower = todaName.toLowerCase().trim();
  return BARANGAY_TODAS.find(t => 
    t.name.toLowerCase() === lower || 
    lower.includes(t.barangay.toLowerCase()) || 
    lower.includes(t.name.toLowerCase().replace(' toda', ''))
  );
}

export function findTodaForBarangay(barangayName?: string): BarangayTodaInfo | undefined {
  if (!barangayName) return undefined;
  const lower = barangayName.toLowerCase().trim();
  return BARANGAY_TODAS.find(t => lower.includes(t.barangay.toLowerCase()));
}

export const PRIORITY_TIER_1_LIMIT_SECONDS = 45; // Step 1: Drivers in that specific pickup barangay's TODA
export const PRIORITY_TIER_2_LIMIT_SECONDS = 90; // Step 2: Expands to same cluster
export const PRIORITY_TIER_3_LIMIT_SECONDS = 135; // Step 3: Expands to other clusters

export interface DriverPriorityResult {
  isEligible: boolean;
  tier: 1 | 2 | 3 | 4;
  tierLabel: string;
  tierBadge: string;
  tierName: string;
  totalElapsedSeconds: number;
  secondsRemainingInTier: number;
  isExpired: boolean;
}

export function getDriverBookingPriority(
  bookingCreatedAt: string,
  pickupBarangay: string,
  driverTodaName?: string,
  driverCluster?: number
): DriverPriorityResult {
  const createdMs = new Date(bookingCreatedAt).getTime();
  const nowMs = Date.now();
  const elapsed = Math.max(0, Math.floor((nowMs - createdMs) / 1000));

  const pickupToda = findTodaForBarangay(pickupBarangay);
  const pickupCluster = getBarangayCluster(pickupBarangay)?.number;

  const driverToda = findTodaByName(driverTodaName);
  const effectiveDriverCluster = driverCluster || driverToda?.cluster;

  // Check if driver is from that exact pickup barangay's TODA
  const isDirectBrgyMatch = Boolean(
    (pickupToda && driverToda && pickupToda.name.toLowerCase() === driverToda.name.toLowerCase()) ||
    (pickupToda && driverTodaName && driverTodaName.toLowerCase().includes(pickupToda.barangay.toLowerCase())) ||
    (pickupBarangay.toLowerCase().includes('poblacion') && effectiveDriverCluster === 1)
  );

  // Check if driver is in the same cluster
  const isSameClusterMatch = Boolean(
    pickupCluster && effectiveDriverCluster && pickupCluster === effectiveDriverCluster
  );

  if (elapsed < PRIORITY_TIER_1_LIMIT_SECONDS) {
    // Step 1: Local Barangay TODA priority
    const secondsRemaining = PRIORITY_TIER_1_LIMIT_SECONDS - elapsed;
    return {
      isEligible: isDirectBrgyMatch,
      tier: 1,
      tierLabel: `Priority Tier 1: Local ${pickupToda?.name || pickupBarangay} Drivers`,
      tierBadge: '🎯 LOCAL TODA PRIORITY',
      tierName: 'Step 1: Local TODA Priority',
      totalElapsedSeconds: elapsed,
      secondsRemainingInTier: secondsRemaining,
      isExpired: false
    };
  } else if (elapsed < PRIORITY_TIER_2_LIMIT_SECONDS) {
    // Step 2: Expanded to same Cluster
    const secondsRemaining = PRIORITY_TIER_2_LIMIT_SECONDS - elapsed;
    return {
      isEligible: isSameClusterMatch,
      tier: 2,
      tierLabel: `Priority Tier 2: Cluster ${pickupCluster || 'Nearby'} Backup`,
      tierBadge: `⚡ CLUSTER ${pickupCluster || ''} BACKUP`,
      tierName: 'Step 2: Cluster Backup Priority',
      totalElapsedSeconds: elapsed,
      secondsRemainingInTier: secondsRemaining,
      isExpired: false
    };
  } else if (elapsed < PRIORITY_TIER_3_LIMIT_SECONDS) {
    // Step 3: Expanded to all remaining drivers in other clusters
    const secondsRemaining = PRIORITY_TIER_3_LIMIT_SECONDS - elapsed;
    return {
      isEligible: true,
      tier: 3,
      tierLabel: 'Priority Tier 3: All Available Gonzaga Drivers',
      tierBadge: '🌐 MUNICIPAL-WIDE EXPANDED',
      tierName: 'Step 3: Municipal-Wide Priority',
      totalElapsedSeconds: elapsed,
      secondsRemainingInTier: secondsRemaining,
      isExpired: false
    };
  } else {
    // Step 5: Timed out / No driver found
    return {
      isEligible: false,
      tier: 4,
      tierLabel: 'Dispatch Time Expired',
      tierBadge: '⏱️ SEARCH EXPIRED',
      tierName: 'Step 5: Dispatch Expired',
      totalElapsedSeconds: elapsed,
      secondsRemainingInTier: 0,
      isExpired: true
    };
  }
}

