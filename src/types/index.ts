export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  barangay: string;
  profileImage?: string; // Cloudinary URL or local Base64
  todaName?: string;
  plateNumber?: string;
  isApproved?: boolean; // For drivers
  isBlocked?: boolean;
  createdAt: string;
}

export type BookingStatus = 
  | 'WAITING_FOR_DRIVER'
  | 'DRIVER_ACCEPTED'
  | 'DRIVER_ARRIVING'
  | 'PASSENGER_PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerMobile: string;
  passengerProfileImage?: string;
  pickupBarangay: string;
  pickupLandmark: string;
  destinationBarangay: string;
  destinationLandmark: string;
  passengersCount: number;
  discountType: 'regular' | 'senior_student_pwd';
  specialNotes?: string;
  estimatedFare: number;
  status: BookingStatus;
  driverId?: string;
  driverName?: string;
  driverMobile?: string;
  driverProfileImage?: string;
  todaName?: string;
  plateNumber?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  isWaitingAlert?: boolean; // True if created via "I'm Waiting"
}

export interface GonzagaRouteFare {
  id: string;
  route: string;
  fromBarangay: string;
  toBarangay: string;
  regularRate: number;
  discountRate: number; // Senior, Student, PWD
  csuRate?: number;
  isSpecialArrangement?: boolean;
}

export interface TodaGroup {
  id: string;
  name: string;
  zoneBarangay: string;
  presidentName: string;
  contactNumber: string;
  activeCount: number;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  targetId: string;
  targetName: string;
  targetRole: UserRole;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Feedback {
  id: string;
  userName: string;
  userRole: UserRole;
  message: string;
  rating: number;
  createdAt: string;
}

export interface SystemSettings {
  fuelSurgeMultiplier: number;
  maxPassengersCapacity: number;
  allowWaitingFeature: boolean;
  contactEmail: string;
  contactNumber: string;
  facebookPage: string;
  officeLocation: string;
}
