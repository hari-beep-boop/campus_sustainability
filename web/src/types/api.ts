// Health
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  mongodb: string;
}

// Auth (Phase 2 placeholder)
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'facility_manager' | 'student';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Analytics (Phase 4 placeholder)
export interface KPISummary {
  energyKwh: number;
  waterL: number;
  co2Ppm: number;
  carbonKg: number;
  wasteKg: number;
  changes: Record<string, number>;
  score: number;
}

export interface TrendPoint {
  date: string;
  energy: number;
  water: number;
  co2Ppm: number;
  carbonKg: number;
  predictedEnergy?: number;
  energyLower?: number;
  energyUpper?: number;
}

export interface BuildingUsage {
  buildingId: string;
  building: string;
  energy: number;
  water: number;
  co2Ppm: number;
  carbonKg: number;
}

export interface WasteBreakdown {
  category: string;
  value: number;
}

// API Error
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
