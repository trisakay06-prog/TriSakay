import type { User, Booking, TodaGroup, UserReport, Feedback, SystemSettings, GonzagaRouteFare, BookingStatus } from '../types';
import { INITIAL_GONZAGA_FARES, INITIAL_GONZAGA_BARANGAYS } from './fareCalculator';
import { playNotificationSound } from './sound';
import { supabase, isSupabaseConfigured } from './supabase';
import { sendBookingAcceptedSMS, sendDriverArrivingSMS } from './smsService';

const STORAGE_KEY = 'trisakay_app_state_v1';
const SESSION_USER_KEY = 'trisakay_session_user_v1';
const BROADCAST_CHANNEL_NAME = 'trisakay_realtime_events';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_pass_1',
    name: 'Sheena Soriano',
    mobile: '09396591974',
    role: 'passenger',
    barangay: 'Calayan',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'user_pass_2',
    name: 'Eduardo Ramos (Senior)',
    mobile: '09289876543',
    role: 'passenger',
    barangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)',
    createdAt: '2026-08-11T09:30:00Z',
  },
  {
    id: 'user_driver_1',
    name: 'Juan Dela Cruz',
    mobile: '09185551234',
    role: 'driver',
    barangay: 'Calayan',
    todaName: 'GOTODA (Gonzaga Toda)',
    plateNumber: 'TZ-9842',
    isApproved: true,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user_driver_2',
    name: 'Pedro Penduko',
    mobile: '09224443322',
    role: 'driver',
    barangay: 'Baua',
    todaName: 'BAUATODA',
    plateNumber: 'TZ-1123',
    isApproved: true,
    createdAt: '2026-08-02T11:00:00Z',
  },
  {
    id: 'user_driver_pending',
    name: 'Mark Reyes',
    mobile: '09356667788',
    role: 'driver',
    barangay: 'Pateng',
    todaName: 'PATENGTODA',
    plateNumber: 'TZ-5544',
    isApproved: false,
    createdAt: '2026-08-13T10:00:00Z',
  },
  {
    id: 'user_admin_1',
    name: 'Gonzaga LGU Admin',
    mobile: '09628039440',
    role: 'admin',
    barangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)',
    createdAt: '2026-08-01T08:00:00Z',
  }
];

export const INITIAL_TODAS: TodaGroup[] = [
  { id: 't1', name: 'GOTODA (Gonzaga Tricycle Operators & Drivers Association)', zoneBarangay: 'Poblacion', presidentName: 'Manuel Valenzuela', contactNumber: '09173338899', activeCount: 45 },
  { id: 't2', name: 'BAUATODA (Baua Drivers Association)', zoneBarangay: 'Baua', presidentName: 'Arnel Castillo', contactNumber: '09204445566', activeCount: 22 },
  { id: 't3', name: 'CALAYANTODA (Calayan Transport Group)', zoneBarangay: 'Calayan', presidentName: 'Roberto Aguinaldo', contactNumber: '09187771122', activeCount: 18 },
  { id: 't4', name: 'PATENGTODA (Pateng Tricycle Group)', zoneBarangay: 'Pateng', presidentName: 'Danilo Pascual', contactNumber: '09278889900', activeCount: 15 },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book_101',
    passengerId: 'user_pass_1',
    passengerName: 'Sheena Soriano',
    passengerMobile: '09171234567',
    pickupBarangay: 'Calayan',
    pickupLandmark: 'Near Calayan Elementary School',
    destinationBarangay: 'CSU Gonzaga Campus',
    destinationLandmark: 'Main Gate Library',
    passengersCount: 3,
    discountType: 'regular',
    specialNotes: 'Carrying luggage and school supplies',
    estimatedFare: 30,
    status: 'COMPLETED',
    driverId: 'user_driver_1',
    driverName: 'Juan Dela Cruz',
    driverMobile: '09185551234',
    todaName: 'GOTODA',
    plateNumber: 'TZ-9842',
    rating: 5,
    ratingComment: 'Very polite driver! Quick pickup.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    acceptedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  }
];

export const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'rep_1',
    reporterId: 'user_pass_1',
    reporterName: 'Sheena Soriano',
    reporterRole: 'passenger',
    targetId: 'user_driver_2',
    targetName: 'Pedro Penduko',
    targetRole: 'driver',
    reason: 'Overcharging Fare',
    details: 'Asked for ₱60 instead of standard matrix ₱35 rate.',
    status: 'pending',
    createdAt: '2026-08-12T14:20:00Z'
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb_1',
    userName: 'Senior Citizen Maria Santos',
    userRole: 'passenger',
    message: 'TriSakay is very easy to use for us seniors! Large buttons are a blessing.',
    rating: 5,
    createdAt: '2026-08-12T09:00:00Z'
  }
];

export interface AppStoreData {
  users: User[];
  bookings: Booking[];
  todas: TodaGroup[];
  fares: GonzagaRouteFare[];
  barangays: string[];
  reports: UserReport[];
  feedback: Feedback[];
  settings: SystemSettings;
  activeDriverOnline: Record<string, boolean>;
  currentUser: User | null;
  seniorMode: boolean;
}

class StoreService {
  private data: AppStoreData;
  private channel: BroadcastChannel | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.data = this.loadState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          // Sync shared store data while preserving current tab user
          const currentUser = this.data?.currentUser || this.loadCurrentUser();
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              this.data = { ...parsed, currentUser };
              this.notifyListeners();
            }
          } catch (e) {
            console.error('Error parsing sync state', e);
          }
          if (event.data?.playChime) {
            playNotificationSound();
          }
        }
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          const currentUser = this.data?.currentUser || this.loadCurrentUser();
          try {
            if (e.newValue) {
              const parsed = JSON.parse(e.newValue);
              this.data = { ...parsed, currentUser };
              this.notifyListeners();
            }
          } catch (err) {
            console.error('Storage event sync error', err);
          }
        }
      });
    }

    if (isSupabaseConfigured && supabase) {
      this.setupSupabaseRealtime();
    }
  }

  private mapSupabaseRowToBooking(row: any): Booking {
    let resolvedDriverId = row.driver_id;
    if (!resolvedDriverId && (row.driver_mobile || row.driver_name)) {
      const found = (this.data?.users || INITIAL_USERS).find(u => 
        (row.driver_mobile && u.mobile === row.driver_mobile) ||
        (row.driver_name && u.name === row.driver_name)
      );
      if (found) resolvedDriverId = found.id;
    }

    return {
      id: row.id?.toString() || `book_${Date.now()}`,
      passengerId: row.passenger_id || 'passenger',
      passengerName: row.passenger_name || 'Passenger',
      passengerMobile: row.passenger_mobile || '09171234567',
      pickupBarangay: row.pickup_barangay,
      pickupLandmark: row.pickup_landmark,
      destinationBarangay: row.destination_barangay,
      destinationLandmark: row.destination_landmark,
      passengersCount: row.passengers_count || 1,
      discountType: row.discount_type || 'regular',
      specialNotes: row.special_notes,
      estimatedFare: Number(row.estimated_fare) || 25,
      status: row.status || 'WAITING_FOR_DRIVER',
      createdAt: row.created_at || new Date().toISOString(),
      acceptedAt: row.accepted_at,
      completedAt: row.completed_at,
      driverId: resolvedDriverId || row.driver_id,
      driverName: row.driver_name,
      driverMobile: row.driver_mobile,
      plateNumber: row.plate_number,
      todaName: row.toda_name,
      isWaitingAlert: row.is_waiting_alert || false
    };
  }

  private setupSupabaseRealtime() {
    if (!supabase) return;

    // Initial sync of existing Supabase bookings
    this.syncFromSupabase();

    // 2-second cloud polling fallback (guarantees cross-device sync on mobile 4G)
    setInterval(() => {
      this.syncFromSupabase();
    }, 2000);

    // Real-time Postgres changes channel
    supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('[TriSakay Supabase] Realtime event:', payload.eventType, payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const incoming = this.mapSupabaseRowToBooking(payload.new);
          const exists = this.data.bookings.some(b => b.id === incoming.id);
          if (!exists) {
            const updated = [incoming, ...this.data.bookings];
            this.data = { ...this.data, bookings: updated };
            this.saveStateToStorage(this.data, true);
            playNotificationSound();
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedRow = this.mapSupabaseRowToBooking(payload.new);
          const updatedBookings = this.data.bookings.map(b => (b.id === updatedRow.id ? { ...b, ...updatedRow } : b));
          this.data = { ...this.data, bookings: updatedBookings };
          this.saveStateToStorage(this.data);
          this.notifyListeners();
        }
      })
      .subscribe();
  }

  public syncFromSupabase() {
    if (!supabase) return;
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25)
      .then(({ data, error }) => {
        if (data && !error && data.length > 0) {
          const incoming = data.map((row: any) => this.mapSupabaseRowToBooking(row));
          let changed = false;
          const currentMap = new Map(this.data.bookings.map(b => [b.id, b]));

          incoming.forEach(row => {
            const local = currentMap.get(row.id);
            if (!local) {
              currentMap.set(row.id, row);
              changed = true;
            } else if (
              local.status !== row.status || 
              local.driverName !== row.driverName || 
              local.plateNumber !== row.plateNumber
            ) {
              currentMap.set(row.id, { ...local, ...row });
              changed = true;
            }
          });

          if (changed) {
            const updated = Array.from(currentMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.data = { ...this.data, bookings: updated };
            this.saveStateToStorage(this.data);
            this.notifyListeners();
          }
        }
      });
  }

  private loadCurrentUser(): User | null {
    if (typeof window === 'undefined') return INITIAL_USERS[0];
    try {
      const session = sessionStorage.getItem(SESSION_USER_KEY);
      if (session) return JSON.parse(session);
      const local = localStorage.getItem(SESSION_USER_KEY);
      if (local) return JSON.parse(local);
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    return INITIAL_USERS[0];
  }

  private loadState(): AppStoreData {
    const currentUser = this.data?.currentUser || this.loadCurrentUser();
    if (typeof window === 'undefined') return { ...this.getInitialData(), currentUser };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, currentUser };
      }
    } catch (e) {
      console.error('Failed to parse state from localStorage', e);
    }
    const initial = this.getInitialData();
    this.saveStateToStorage(initial);
    return { ...initial, currentUser };
  }

  private getInitialData(): AppStoreData {
    return {
      users: INITIAL_USERS,
      bookings: INITIAL_BOOKINGS,
      todas: INITIAL_TODAS,
      fares: INITIAL_GONZAGA_FARES,
      barangays: INITIAL_GONZAGA_BARANGAYS,
      reports: INITIAL_REPORTS,
      feedback: INITIAL_FEEDBACK,
      settings: {
        fuelSurgeMultiplier: 1.0,
        maxPassengersCapacity: 8,
        allowWaitingFeature: true,
        contactEmail: 'trisakay@gmail.com',
        contactNumber: '09628039440',
        facebookPage: 'TriSakay Gonzaga',
        officeLocation: 'Municipality of Gonzaga, Cagayan'
      },
      activeDriverOnline: {
        user_driver_1: true,
        user_driver_2: true
      },
      currentUser: INITIAL_USERS[0],
      seniorMode: false
    };
  }

  private saveStateToStorage(data: AppStoreData, playChime = false) {
    if (typeof window === 'undefined') return;
    try {
      this.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notifyListeners();
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATED', playChime, timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Error writing store state to localStorage', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public getState(): AppStoreData {
    return this.data;
  }

  public setCurrentUser(user: User | null) {
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(SESSION_USER_KEY);
        localStorage.removeItem(SESSION_USER_KEY);
      }
    }
    this.data = { ...this.data, currentUser: user };
    this.notifyListeners();
  }

  public toggleSeniorMode() {
    const updated = { ...this.data, seniorMode: !this.data.seniorMode };
    this.saveStateToStorage(updated);
  }

  public setDriverOnlineStatus(driverId: string, isOnline: boolean) {
    const updatedOnline = { ...this.data.activeDriverOnline, [driverId]: isOnline };
    const updated = { ...this.data, activeDriverOnline: updatedOnline };
    this.saveStateToStorage(updated);
  }

  public createBooking(payload: {
    pickupBarangay: string;
    pickupLandmark: string;
    destinationBarangay: string;
    destinationLandmark: string;
    passengersCount: number;
    discountType: 'regular' | 'senior_student_pwd';
    specialNotes?: string;
    estimatedFare: number;
    isWaitingAlert?: boolean;
  }): Booking {
    const user = this.data.currentUser || INITIAL_USERS[0];
    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      passengerId: user.id,
      passengerName: user.name,
      passengerMobile: user.mobile,
      pickupBarangay: payload.pickupBarangay,
      pickupLandmark: payload.pickupLandmark,
      destinationBarangay: payload.destinationBarangay || 'On-The-Way Dropoff',
      destinationLandmark: payload.destinationLandmark || 'Route Dropoff',
      passengersCount: payload.passengersCount,
      discountType: payload.discountType,
      specialNotes: payload.specialNotes,
      estimatedFare: payload.estimatedFare,
      status: 'WAITING_FOR_DRIVER',
      createdAt: new Date().toISOString(),
      isWaitingAlert: payload.isWaitingAlert || false
    };

    // Supersede any older WAITING_FOR_DRIVER bookings for this passenger
    const cleanOld = this.data.bookings.map(b => {
      if ((b.passengerId === user.id || b.passengerMobile === user.mobile) && b.status === 'WAITING_FOR_DRIVER') {
        return { ...b, status: 'CANCELLED' as BookingStatus };
      }
      return b;
    });

    const updatedBookings = [newBooking, ...cleanOld];
    this.saveStateToStorage({ ...this.data, bookings: updatedBookings }, true);
    playNotificationSound();

    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').insert([{
        passenger_name: newBooking.passengerName,
        passenger_mobile: newBooking.passengerMobile,
        pickup_barangay: newBooking.pickupBarangay,
        pickup_landmark: newBooking.pickupLandmark,
        destination_barangay: newBooking.destinationBarangay,
        destination_landmark: newBooking.destinationLandmark,
        passengers_count: newBooking.passengersCount,
        discount_type: newBooking.discountType,
        special_notes: newBooking.specialNotes,
        estimated_fare: newBooking.estimatedFare,
        status: newBooking.status,
        is_waiting_alert: newBooking.isWaitingAlert
      }]).select().single().then(({ data, error }) => {
        if (data?.id) {
          const synced = this.data.bookings.map(b => b.id === newBooking.id ? { ...b, id: data.id } : b);
          this.data = { ...this.data, bookings: synced };
          this.saveStateToStorage(this.data);
        }
        if (error) console.error('Supabase booking insert error:', error);
      });
    }

    return newBooking;
  }

  public updateBookingStatus(bookingId: string, status: BookingStatus, driver?: User) {
    const updatedBookings = this.data.bookings.map(b => {
      if (b.id === bookingId) {
        const next: Booking = { ...b, status };
        if (driver) {
          next.driverId = driver.id;
          next.driverName = driver.name;
          next.driverMobile = driver.mobile;
          next.todaName = driver.todaName || 'GOTODA (Gonzaga Toda)';
          next.plateNumber = driver.plateNumber || 'TZ-9842';
        }
        if (status === 'DRIVER_ACCEPTED') {
          next.acceptedAt = new Date().toISOString();
          const dName = driver?.name || next.driverName || 'Driver';
          const dMobile = driver?.mobile || next.driverMobile || '09185551234';
          const toda = driver?.todaName || next.todaName || 'GOTODA (Gonzaga Toda)';
          const plate = driver?.plateNumber || next.plateNumber || 'TZ-9842';
          sendBookingAcceptedSMS(
            b.passengerName,
            b.passengerMobile,
            dName,
            dMobile,
            toda,
            plate,
            b.estimatedFare
          );
        }
        if (status === 'DRIVER_ARRIVING') {
          const dName = driver?.name || next.driverName || 'Driver';
          const plate = driver?.plateNumber || next.plateNumber || 'TZ-9842';
          sendDriverArrivingSMS(
            b.passengerName,
            b.passengerMobile,
            dName,
            plate
          );
        }
        if (status === 'COMPLETED') {
          next.completedAt = new Date().toISOString();
        }
        return next;
      }
      return b;
    });

    this.saveStateToStorage({ ...this.data, bookings: updatedBookings }, status === 'DRIVER_ACCEPTED');

    if (isSupabaseConfigured && supabase) {
      const b = updatedBookings.find(x => x.id === bookingId);
      if (b) {
        const payload: Record<string, any> = {
          status: b.status,
          driver_name: b.driverName || null,
          driver_mobile: b.driverMobile || null,
          plate_number: b.plateNumber || null,
          toda_name: b.todaName || null
        };
        if (b.acceptedAt) payload.accepted_at = b.acceptedAt;
        if (b.completedAt) payload.completed_at = b.completedAt;

        supabase
          .from('bookings')
          .update(payload)
          .eq('id', bookingId)
          .then(({ error }) => {
            if (error && supabase) {
              supabase
                .from('bookings')
                .update(payload)
                .eq('passenger_mobile', b.passengerMobile)
                .then(() => {});
            }
          });
      }
    }
  }

  public rateBooking(bookingId: string, rating: number, comment?: string) {
    const updatedBookings = this.data.bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, rating, ratingComment: comment };
      }
      return b;
    });
    this.saveStateToStorage({ ...this.data, bookings: updatedBookings });
  }

  public registerUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: user.role === 'driver' ? false : true
    };

    const updatedUsers = [...this.data.users, newUser];
    this.saveStateToStorage({ ...this.data, users: updatedUsers, currentUser: newUser });
    return newUser;
  }

  public approveDriver(driverId: string, isApproved: boolean) {
    const updatedUsers = this.data.users.map(u => {
      if (u.id === driverId) {
        return { ...u, isApproved };
      }
      return u;
    });
    this.saveStateToStorage({ ...this.data, users: updatedUsers });
  }

  public toggleBlockUser(userId: string) {
    const updatedUsers = this.data.users.map(u => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    });
    this.saveStateToStorage({ ...this.data, users: updatedUsers });
  }

  public updateFareRate(fareId: string, regularRate: number, discountRate: number, csuRate?: number) {
    const updatedFares = this.data.fares.map(f => {
      if (f.id === fareId) {
        return { ...f, regularRate, discountRate, csuRate };
      }
      return f;
    });
    this.saveStateToStorage({ ...this.data, fares: updatedFares });
  }

  public addFareRoute(route: Omit<GonzagaRouteFare, 'id'>) {
    const newFare: GonzagaRouteFare = {
      ...route,
      id: `fare_${Date.now()}`
    };
    const updatedFares = [...this.data.fares, newFare];
    this.saveStateToStorage({ ...this.data, fares: updatedFares });
  }

  public updateSystemSettings(settings: Partial<SystemSettings>) {
    const updatedSettings = { ...this.data.settings, ...settings };
    this.saveStateToStorage({ ...this.data, settings: updatedSettings });
  }

  public submitReport(report: Omit<UserReport, 'id' | 'createdAt' | 'status'>) {
    const newReport: UserReport = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newReport, ...this.data.reports];
    this.saveStateToStorage({ ...this.data, reports: updated });
  }

  public resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
    const updated = this.data.reports.map(r => r.id === reportId ? { ...r, status } : r);
    this.saveStateToStorage({ ...this.data, reports: updated });
  }

  public addFeedback(fb: Omit<Feedback, 'id' | 'createdAt'>) {
    const newFb: Feedback = {
      ...fb,
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newFb, ...this.data.feedback];
    this.saveStateToStorage({ ...this.data, feedback: updated });
  }

  public removeUser(userId: string) {
    const updatedUsers = this.data.users.filter(u => u.id !== userId);
    this.saveStateToStorage({ ...this.data, users: updatedUsers });
  }

  public updateUser(userId: string, updates: Partial<User>) {
    const updatedUsers = this.data.users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    const updatedCurrentUser = this.data.currentUser?.id === userId 
      ? { ...this.data.currentUser, ...updates }
      : this.data.currentUser;
    this.saveStateToStorage({ ...this.data, users: updatedUsers, currentUser: updatedCurrentUser });
  }

  public addBarangay(name: string) {
    if (!name || this.data.barangays.includes(name)) return;
    const updated = [...this.data.barangays, name];
    this.saveStateToStorage({ ...this.data, barangays: updated });
  }

  public removeBarangay(name: string) {
    const updated = this.data.barangays.filter(b => b !== name);
    this.saveStateToStorage({ ...this.data, barangays: updated });
  }

  public addToda(toda: Omit<TodaGroup, 'id'>) {
    const newToda: TodaGroup = {
      ...toda,
      id: `toda_${Date.now()}`
    };
    const updated = [...this.data.todas, newToda];
    this.saveStateToStorage({ ...this.data, todas: updated });
  }

  public removeToda(todaId: string) {
    const updated = this.data.todas.filter(t => t.id !== todaId);
    this.saveStateToStorage({ ...this.data, todas: updated });
  }

  public resetToDefault() {
    const initial = this.getInitialData();
    this.saveStateToStorage(initial);
  }
}

export const store = new StoreService();
