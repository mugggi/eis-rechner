export interface IceFlavor {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface WeightEntry {
  id?: string;
  business_id: string;
  flavor_id: string;
  gross_weight: number;
  net_weight: number;
  container_weight: number;
  date: string;
  created_at?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomFlavor {
  id?: string;
  name: string;
  icon: string;
  color: string;
  created_at?: string;
}

export interface ExportFilter {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
}

// Daily Sales Types
export interface SalesData {
  [flavorId: string]: number;
}

export interface DailySales {
  id?: string;
  date: string;
  sales: SalesData;
  customer_profile_id: string;
  created_at?: string;
  updated_at?: string;
}

// Legacy types for compatibility
export interface CustomerProfile extends Business {}
export interface IceCreamFlavor extends IceFlavor {}