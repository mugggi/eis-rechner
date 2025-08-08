import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { WeightEntry, CustomFlavor, Business, ExportFilter, DailySales, SalesData } from '../types';

export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: string, month: string): string => {
    const nextMonth = new Date(parseInt(year), parseInt(month), 1);
    const lastDay = new Date(nextMonth.getTime() - 1);
    return lastDay.toISOString().split('T')[0];
  };

  const saveWeightEntry = async (entry: WeightEntry) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          business_id: entry.business_id,
          flavor_id: entry.flavor_id,
          gross_weight: entry.gross_weight,
          net_weight: entry.net_weight,
          container_weight: entry.container_weight,
          date: entry.date
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWeightEntry = async (entry: WeightEntry) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .update({
          flavor_id: entry.flavor_id,
          gross_weight: entry.gross_weight,
          net_weight: entry.net_weight,
          container_weight: entry.container_weight,
          date: entry.date
        })
        .eq('id', entry.id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Aktualisieren';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWeightEntry = async (entryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMonthlyEntries = async (businessId: string, month: string, year: string): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate start and end dates for the month
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = getLastDayOfMonth(year, month);

      // First, get count of entries to be deleted
      const { data: countData, error: countError } = await supabase
        .from('weight_entries')
        .select('id', { count: 'exact' })
        .eq('business_id', businessId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (countError) throw countError;

      const deleteCount = countData?.length || 0;

      // Delete the entries
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('business_id', businessId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      return deleteCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen der monatlichen Daten';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWeightEntries = async (businessId: string, filter?: ExportFilter): Promise<WeightEntry[]> => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('weight_entries')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (filter?.startDate && filter?.endDate) {
        query = query.gte('date', filter.startDate).lte('date', filter.endDate);
      } else if (filter?.month && filter?.year) {
        const startDate = `${filter.year}-${filter.month.padStart(2, '0')}-01`;
        const endDate = getLastDayOfMonth(filter.year, filter.month);
        query = query.gte('date', startDate).lte('date', endDate);
      } else if (filter?.year) {
        query = query.gte('date', `${filter.year}-01-01`).lte('date', `${filter.year}-12-31`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveCustomFlavor = async (flavor: CustomFlavor) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('custom_flavors')
        .insert({
          name: flavor.name,
          icon: flavor.icon,
          color: flavor.color
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomFlavor = async (flavorId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('custom_flavors')
        .delete()
        .eq('id', flavorId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCustomFlavors = async (): Promise<CustomFlavor[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('custom_flavors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBusinesses = async (): Promise<Business[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert({
          name: business.name,
          description: business.description,
          color: business.color,
          icon: business.icon,
          is_active: business.is_active
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (business: Business): Promise<Business> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .update({
          name: business.name,
          description: business.description,
          color: business.color,
          icon: business.icon,
          is_active: business.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (businessId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Daily Sales Funktionen
  const getDailySales = async (date: string, customerProfileId: string): Promise<DailySales | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('date', date)
        .eq('customer_profile_id', customerProfileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveDailySales = async (dailySales: DailySales): Promise<DailySales> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .upsert({
          date: dailySales.date,
          customer_profile_id: dailySales.customer_profile_id,
          sales: dailySales.sales,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date,customer_profile_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllSales = async (customerProfileId: string): Promise<DailySales[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('customer_profile_id', customerProfileId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getHiddenFlavors = async (): Promise<string[]> => {
    // Placeholder - könnte später implementiert werden
    return [];
  };

  const saveHiddenFlavors = async (hiddenFlavors: string[]): Promise<void> => {
    // Placeholder - könnte später implementiert werden
  };

  return {
    loading,
    error,
    saveWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    deleteMonthlyEntries,
    getWeightEntries,
    saveCustomFlavor,
    deleteCustomFlavor,
    getCustomFlavors,
    getBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getDailySales,
    saveDailySales,
    getAllSales,
    getHiddenFlavors,
    saveHiddenFlavors
  };
}