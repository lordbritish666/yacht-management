import { Berth } from '@/types'

// 30 berths: A (sailboat), B (motor), C (large), D (mega)
export const BERTHS: Berth[] = [
  // A-berths: Sailboats (8–12m)
  { id: 'a01', code: 'A-01', name: 'Berth A-01', category: 'sailboat', length_m: 10, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a02', code: 'A-02', name: 'Berth A-02', category: 'sailboat', length_m: 10, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a03', code: 'A-03', name: 'Berth A-03', category: 'sailboat', length_m: 11, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a04', code: 'A-04', name: 'Berth A-04', category: 'sailboat', length_m: 11, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a05', code: 'A-05', name: 'Berth A-05', category: 'sailboat', length_m: 12, width_m: 4.0, depth_m: 2.5, is_active: true },
  { id: 'a06', code: 'A-06', name: 'Berth A-06', category: 'sailboat', length_m: 12, width_m: 4.0, depth_m: 2.5, is_active: true },
  { id: 'a07', code: 'A-07', name: 'Berth A-07', category: 'sailboat', length_m: 10, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a08', code: 'A-08', name: 'Berth A-08', category: 'sailboat', length_m: 10, width_m: 3.5, depth_m: 2.5, is_active: true },
  { id: 'a09', code: 'A-09', name: 'Berth A-09', category: 'sailboat', length_m: 11, width_m: 3.5, depth_m: 2.8, is_active: true },
  { id: 'a10', code: 'A-10', name: 'Berth A-10', category: 'sailboat', length_m: 12, width_m: 4.0, depth_m: 2.8, is_active: true },

  // B-berths: Motor yachts (12–20m)
  { id: 'b01', code: 'B-01', name: 'Berth B-01', category: 'motor', length_m: 14, width_m: 5.0, depth_m: 3.0, is_active: true },
  { id: 'b02', code: 'B-02', name: 'Berth B-02', category: 'motor', length_m: 14, width_m: 5.0, depth_m: 3.0, is_active: true },
  { id: 'b03', code: 'B-03', name: 'Berth B-03', category: 'motor', length_m: 16, width_m: 5.5, depth_m: 3.0, is_active: true },
  { id: 'b04', code: 'B-04', name: 'Berth B-04', category: 'motor', length_m: 16, width_m: 5.5, depth_m: 3.0, is_active: true },
  { id: 'b05', code: 'B-05', name: 'Berth B-05', category: 'motor', length_m: 18, width_m: 6.0, depth_m: 3.2, is_active: true },
  { id: 'b06', code: 'B-06', name: 'Berth B-06', category: 'motor', length_m: 18, width_m: 6.0, depth_m: 3.2, is_active: true },
  { id: 'b07', code: 'B-07', name: 'Berth B-07', category: 'motor', length_m: 20, width_m: 6.0, depth_m: 3.5, is_active: true },
  { id: 'b08', code: 'B-08', name: 'Berth B-08', category: 'motor', length_m: 20, width_m: 6.0, depth_m: 3.5, is_active: true },
  { id: 'b09', code: 'B-09', name: 'Berth B-09', category: 'motor', length_m: 15, width_m: 5.0, depth_m: 3.0, is_active: true },
  { id: 'b10', code: 'B-10', name: 'Berth B-10', category: 'motor', length_m: 17, width_m: 5.5, depth_m: 3.2, is_active: true },

  // C-berths: Large yachts (20–35m)
  { id: 'c01', code: 'C-01', name: 'Berth C-01', category: 'large', length_m: 22, width_m: 7.0, depth_m: 4.0, is_active: true },
  { id: 'c02', code: 'C-02', name: 'Berth C-02', category: 'large', length_m: 25, width_m: 7.5, depth_m: 4.0, is_active: true },
  { id: 'c03', code: 'C-03', name: 'Berth C-03', category: 'large', length_m: 28, width_m: 8.0, depth_m: 4.5, is_active: true },
  { id: 'c04', code: 'C-04', name: 'Berth C-04', category: 'large', length_m: 28, width_m: 8.0, depth_m: 4.5, is_active: true },
  { id: 'c05', code: 'C-05', name: 'Berth C-05', category: 'large', length_m: 30, width_m: 8.5, depth_m: 4.5, is_active: true },
  { id: 'c06', code: 'C-06', name: 'Berth C-06', category: 'large', length_m: 32, width_m: 9.0, depth_m: 5.0, is_active: true },
  { id: 'c07', code: 'C-07', name: 'Berth C-07', category: 'large', length_m: 35, width_m: 9.0, depth_m: 5.0, is_active: true },

  // D-berths: Megayachts (35–55m)
  { id: 'd01', code: 'D-01', name: 'Berth D-01', category: 'mega', length_m: 40, width_m: 10.0, depth_m: 5.5, is_active: true },
  { id: 'd02', code: 'D-02', name: 'Berth D-02', category: 'mega', length_m: 48, width_m: 12.0, depth_m: 6.0, is_active: true },
  { id: 'd03', code: 'D-03', name: 'Berth D-03', category: 'mega', length_m: 55, width_m: 14.0, depth_m: 6.5, is_active: true },
]

export const BERTH_CATEGORY_LABELS: Record<string, string> = {
  sailboat: 'Sailboat',
  motor: 'Motor Yacht',
  large: 'Large Yacht',
  mega: 'Megayacht',
}

export const BERTH_CATEGORY_COLORS: Record<string, string> = {
  sailboat: 'text-sky-400',
  motor: 'text-violet-400',
  large: 'text-amber-400',
  mega: 'text-rose-400',
}
