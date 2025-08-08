import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { Business, DailySales } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import * as XLSX from 'xlsx';

interface SalesHistoryProps {
  selectedBusiness: Business;
}

export default function SalesHistory({ selectedBusiness }: SalesHistoryProps) {
  const [salesHistory, setSalesHistory] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(false);
  const { getAllSales, getCustomFlavors } = useSupabase();

  useEffect(() => {
    loadSalesHistory();
  }, [selectedBusiness.id]);

  const loadSalesHistory = async () => {
    setLoading(true);
    try {
      const history = await getAllSales(selectedBusiness.id);
      setSalesHistory(history);
    } catch (error) {
      console.error('Error loading sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // Get custom flavors for complete flavor mapping
      const customFlavors = await getCustomFlavors();
      const allFlavors = customFlavors.map(cf => ({
        id: cf.id!,
        name: cf.name,
        icon: cf.icon,
        color: cf.color,
      }));

      // Create flavor name mapping
      const flavorNames: { [key: string]: string } = {};
      allFlavors.forEach(flavor => {
        flavorNames[flavor.id] = flavor.name;
      });

      // Prepare data for Excel
      const excelData = salesHistory.map(day => {
        const row: any = {
          Datum: day.date,
          Gesamt: Object.values(day.sales).reduce((sum, count) => sum + count, 0),
        };

        // Add each flavor as a column
        Object.entries(day.sales).forEach(([flavorId, count]) => {
          const flavorName = flavorNames[flavorId] || flavorId;
          row[flavorName] = count;
        });

        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Verkaufsdaten');

      // Generate filename with current date
      const now = new Date();
      const filename = `${selectedBusiness.name}_Verkaufsdaten_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Fehler beim Exportieren der Daten');
    }
  };

  const calculateStats = () => {
    if (salesHistory.length === 0) return { total: 0, average: 0, best: 0 };

    const dailyTotals = salesHistory.map(day => 
      Object.values(day.sales).reduce((sum, count) => sum + count, 0)
    );

    const total = dailyTotals.reduce((sum, daily) => sum + daily, 0);
    const average = Math.round(total / salesHistory.length);
    const best = Math.max(...dailyTotals);

    return { total, average, best };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-600">Lade Verkaufsverlauf...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Gesamtverkäufe</p>
              <p className="text-3xl font-bold text-amber-600">{stats.total}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Durchschnitt/Tag</p>
              <p className="text-3xl font-bold text-blue-600">{stats.average}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Bester Tag</p>
              <p className="text-3xl font-bold text-green-600">{stats.best}</p>
            </div>
            <Calendar className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-stone-800">Daten exportieren</h3>
            <p className="text-stone-600">Exportieren Sie Ihre Verkaufsdaten als Excel-Datei</p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium"
          >
            <Download className="h-5 w-5" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-100">
        <div className="p-6 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800">Verkaufsverlauf</h3>
          <p className="text-stone-600">Übersicht aller vergangenen Verkaufstage</p>
        </div>

        {salesHistory.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-stone-600 mb-2">Keine Verkaufsdaten vorhanden</h3>
            <p className="text-stone-400">Beginnen Sie mit der Erfassung von Verkäufen im Verkaufstracker</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-stone-700">Datum</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Gesamtverkäufe</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {salesHistory.map((day) => {
                  const dailyTotal = Object.values(day.sales).reduce((sum, count) => sum + count, 0);
                  const formattedDate = new Date(day.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <tr key={day.date} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-stone-800">{formattedDate}</div>
                        <div className="text-sm text-stone-500">{day.date}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-amber-600">{dailyTotal}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {Object.entries(day.sales)
                            .filter(([_, count]) => count > 0)
                            .map(([flavorId, count]) => (
                              <span
                                key={flavorId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800"
                              >
                                {flavorId}: {count}
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}