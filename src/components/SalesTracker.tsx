import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, Minus, Trash2, Check, X } from 'lucide-react';
import { Business, IceFlavor, SalesData, DailySales, CustomFlavor } from '../types';
import { useSupabase } from '../hooks/useSupabase';

interface SalesTrackerProps {
  selectedBusiness: Business;
  currentDate: string;
  onDateChange: (date: string) => void;
}

export default function SalesTracker({ selectedBusiness, currentDate, onDateChange }: SalesTrackerProps) {
  const [salesData, setSalesData] = useState<SalesData>({});
  const [customFlavors, setCustomFlavors] = useState<CustomFlavor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const { getDailySales, saveDailySales, getCustomFlavors } = useSupabase();

  useEffect(() => {
    loadDailySales();
    loadCustomFlavors();
  }, [currentDate, selectedBusiness.id]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadDailySales = async () => {
    setLoading(true);
    try {
      const data = await getDailySales(currentDate, selectedBusiness.id);
      setSalesData(data?.sales || {});
    } catch (error) {
      console.error('Error loading daily sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomFlavors = async () => {
    try {
      const flavors = await getCustomFlavors();
      setCustomFlavors(flavors);
    } catch (error) {
      console.error('Error loading custom flavors:', error);
    }
  };

  const saveSales = async () => {
    setSaving(true);
    try {
      const dailySales: DailySales = {
        date: currentDate,
        sales: salesData,
        customer_profile_id: selectedBusiness.id,
      };
      await saveDailySales(dailySales);
      showNotification('success', 'Verkaufsdaten erfolgreich gespeichert');
    } catch (error) {
      console.error('Error saving sales:', error);
      showNotification('error', 'Fehler beim Speichern der Verkaufsdaten');
    } finally {
      setSaving(false);
    }
  };

  const updateSales = (flavorId: string, change: number) => {
    setSalesData(prev => {
      const currentValue = prev[flavorId] || 0;
      const newValue = Math.max(0, currentValue + change);
      return {
        ...prev,
        [flavorId]: newValue,
      };
    });
  };

  const resetSales = (flavorId: string) => {
    setSalesData(prev => {
      const newData = { ...prev };
      delete newData[flavorId];
      return newData;
    });
  };

  const allFlavors: IceFlavor[] = customFlavors.map(cf => ({
    id: cf.id!,
    name: cf.name,
    icon: cf.icon,
    color: cf.color,
    isCustom: true,
  }));

  const totalSales = Object.values(salesData).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Date Selector and Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-amber-600" />
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-1">
                Verkaufsdatum
              </label>
              <input
                id="date"
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-stone-600">Gesamtverkäufe heute</p>
            <p className="text-3xl font-bold text-amber-600">{totalSales}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSales}
            disabled={saving}
            className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Speichert...' : 'Speichern'}</span>
          </button>
        </div>
      </div>

      {/* Flavor Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Lade Verkaufsdaten...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allFlavors.map((flavor) => {
            const count = salesData[flavor.id] || 0;
            return (
              <div key={flavor.id} className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${flavor.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {flavor.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-stone-800 text-center mb-4">{flavor.name}</h3>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => updateSales(flavor.id, -1)}
                    disabled={count === 0}
                    className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  
                  <div className="text-2xl font-bold text-stone-800 min-w-[3rem] text-center">
                    {count}
                  </div>
                  
                  <button
                    onClick={() => updateSales(flavor.id, 1)}
                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {count > 0 && (
                  <button
                    onClick={() => resetSales(flavor.id)}
                    className="w-full text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Zurücksetzen</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {allFlavors.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-stone-600 mb-4">Keine Eissorten verfügbar.</p>
          <p className="text-sm text-stone-500">
            Gehen Sie zu "Sorten verwalten", um Eissorten hinzuzufügen.
          </p>
        </div>
      )}
    </div>
  );
}