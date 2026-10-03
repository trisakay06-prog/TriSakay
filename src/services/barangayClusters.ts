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
    barangays: ['Flourishing', 'Paradise', 'Progressive', 'Smart', 'Sta. Clara']
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
  return CLUSTER_BY_BARANGAY.get(barangay.trim().toLocaleLowerCase());
}
