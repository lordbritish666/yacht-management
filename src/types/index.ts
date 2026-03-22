export type BerthCategory = 'sailboat' | 'motor' | 'large' | 'mega'
export type BerthStatus = 'vacant' | 'reserved' | 'occupied' | 'away'

export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

export type MovementType = 'checkin' | 'departure' | 'return' | 'checkout'

export type UserRole = 'superadmin' | 'harbour_master' | 'staff'

export interface Berth {
  id: string
  code: string
  name: string
  category: BerthCategory
  length_m: number
  width_m: number
  depth_m: number
  is_active: boolean
  notes?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Booking {
  id: string
  berth_id: string
  berth?: Berth
  vessel_name: string
  vessel_type: string
  vessel_length_m: number
  owner_name: string
  owner_contact: string
  arrival_date: string
  departure_date: string
  status: BookingStatus
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface VesselMovement {
  id: string
  booking_id: string
  booking?: Booking
  berth_id: string
  berth?: Berth
  type: MovementType
  timestamp: string
  reason?: string
  notes?: string
  recorded_by: string
  recorded_by_profile?: Profile
}

export interface BerthWithStatus extends Berth {
  status: BerthStatus
  current_booking?: Booking
}

export interface DashboardStats {
  total: number
  occupied: number
  vacant: number
  reserved: number
  away: number
}
