import React, { useState } from 'react';
import { Download, Calendar, FileSpreadsheet, Check, X, BarChart3 } from 'lucide-react';
import { Business, IceFlavor, ExportFilter } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import * as XLSX from 'xlsx';

interface ExportManagerProps {
  selectedBusiness: Business;
  allFlavors: IceFlavor[];
}

export default function ExportManager({ selectedBusiness, allFlavors }: ExportManagerProps) {
  const [exportType, setExportType] = useState<'date' | 'month' | 'year'>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [previewData, setPreviewData] = useState<{entries: any[], summary: any[]} | null>(null);
  const { getWeightEntries } = useSupabase();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getFilterForExport = () => {
    let filter: ExportFilter = {};

    switch (exportType) {
      case 'date':
        if (!startDate || !endDate) {
          showNotification('error', 'Bitte wählen Sie Start- und Enddatum aus');
          return null;
        }
        filter = { startDate, endDate };
        break;
      case 'month':
        if (!selectedMonth || !selectedYear) {
          showNotification('error', 'Bitte wählen Sie Monat und Jahr aus');
          return null;
        }
        filter = { month: selectedMonth, year: selectedYear };
        break;
      case 'year':
        if (!selectedYear) {
          showNotification('error', 'Bitte wählen Sie ein Jahr aus');
          return null;
        }
        filter = { year: selectedYear };
        break;
    }

    return filter;
  };

  const loadPreviewData = async () => {
    const filter = getFilterForExport();
    if (!filter) return;

    setLoading(true);
    try {
      const entries = await getWeightEntries(selectedBusiness.id, filter);

      if (entries.length === 0) {
        showNotification('error', 'Keine Daten für den ausgewählten Zeitraum gefunden');
        setPreviewData(null);
        return;
      }

      // Create flavor name mapping
      const flavorNames: { [key: string]: string } = {};
      allFlavors.forEach(flavor => {
        flavorNames[flavor.id] = flavor.name;
      });

      // Calculate summary by flavor
      const flavorSummary: { [key: string]: { name: string, totalNet: number, totalGross: number, count: number, icon: string, color: string } } = {};
      
      entries.forEach(entry => {
        const flavorId = entry.flavor_id;
        const flavor = allFlavors.find(f => f.id === flavorId);
        
        if (!flavorSummary[flavorId]) {
          flavorSummary[flavorId] = {
            name: flavorNames[flavorId] || flavorId,
            totalNet: 0,
            totalGross: 0,
            count: 0,
            icon: flavor?.icon || '🍦',
            color: flavor?.color || 'from-stone-200 to-stone-300'
          };
        }
        
        flavorSummary[flavorId].totalNet += entry.net_weight;
        flavorSummary[flavorId].totalGross += entry.gross_weight;
        flavorSummary[flavorId].count += 1;
      });

      const summaryArray = Object.entries(flavorSummary)
        .map(([flavorId, data]) => ({
          flavorId,
          ...data
        }))
        .sort((a, b) => b.totalNet - a.totalNet); // Sort by total net weight descending

      setPreviewData({ entries, summary: summaryArray });
    } catch (error) {
      console.error('Error loading preview data:', error);
      showNotification('error', 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!previewData) {
      await loadPreviewData();
      return;
    }

    setLoading(true);
    try {
      const { entries, summary } = previewData;

      // Create flavor name mapping
      const flavorNames: { [key: string]: string } = {};
      allFlavors.forEach(flavor => {
        flavorNames[flavor.id] = flavor.name;
      });

      // Prepare detailed data for Excel
      const detailData = entries.map(entry => ({
        Datum: entry.date,
        Geschäft: selectedBusiness.name,
        Eissorte: flavorNames[entry.flavor_id] || entry.flavor_id,
        'Brutto-Gewicht (g)': entry.gross_weight,
        'Behälter-Gewicht (g)': entry.container_weight,
        'Netto-Gewicht (g)': entry.net_weight,
        Erstellt: new Date(entry.created_at!).toLocaleString('de-DE'),
      }));

      // Prepare summary data for Excel
      const summaryData = summary.map(item => ({
        Eissorte: item.name,
        'Anzahl Einträge': item.count,
        'Gesamt Brutto (g)': Math.round(item.totalGross),
        'Gesamt Netto (g)': Math.round(item.totalNet),
        'Durchschnitt Netto (g)': Math.round(item.totalNet / item.count),
      }));

      // Add total row to summary
      const totalNet = summary.reduce((sum, item) => sum + item.totalNet, 0);
      const totalGross = summary.reduce((sum, item) => sum + item.totalGross, 0);
      const totalCount = summary.reduce((sum, item) => sum + item.count, 0);
      
      summaryData.push({
        Eissorte: 'GESAMT',
        'Anzahl Einträge': totalCount,
        'Gesamt Brutto (g)': Math.round(totalGross),
        'Gesamt Netto (g)': Math.round(totalNet),
        'Durchschnitt Netto (g)': Math.round(totalNet / totalCount),
      });

      // Create workbook and worksheets
      const wb = XLSX.utils.book_new();
      
      // Add summary worksheet first
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Zusammenfassung');
      
      // Add detailed data worksheet
      const detailWs = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, detailWs, 'Detaildaten');

      // Generate filename
      let filename = `${selectedBusiness.name}_Gewichtsdaten`;
      switch (exportType) {
        case 'date':
          filename += `_${startDate}_bis_${endDate}`;
          break;
        case 'month':
          filename += `_${selectedYear}-${selectedMonth.padStart(2, '0')}`;
          break;
        case 'year':
          filename += `_${selectedYear}`;
          break;
      }
      filename += '.xlsx';

      // Save file
      XLSX.writeFile(wb, filename);
      showNotification('success', `Export erfolgreich! ${entries.length} Einträge exportiert.`);
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('error', 'Fehler beim Exportieren der Daten');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Januar' },
    { value: '2', label: 'Februar' },
    { value: '3', label: 'März' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Dezember' },
  ];

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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <div className="flex items-center space-x-3 mb-4">
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Daten exportieren</h2>
            <p className="text-stone-600">Exportieren Sie Gewichtsdaten als Excel-Datei mit Zusammenfassung</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Export-Optionen</h3>
        
        {/* Export Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Zeitraum auswählen
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="date"
                checked={exportType === 'date'}
                onChange={(e) => setExportType(e.target.value as 'date')}
                className="mr-2"
              />
              Datumsbereich
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="month"
                checked={exportType === 'month'}
                onChange={(e) => setExportType(e.target.value as 'month')}
                className="mr-2"
              />
              Monat
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="year"
                checked={exportType === 'year'}
                onChange={(e) => setExportType(e.target.value as 'year')}
                className="mr-2"
              />
              Jahr
            </label>
          </div>
        </div>

        {/* Date Range Selection */}
        {exportType === 'date' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-stone-700 mb-2">
                Startdatum
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-stone-700 mb-2">
                Enddatum
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Month Selection */}
        {exportType === 'month' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-stone-700 mb-2">
                Monat
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Monat auswählen</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="monthYear" className="block text-sm font-medium text-stone-700 mb-2">
                Jahr
              </label>
              <select
                id="monthYear"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Year Selection */}
        {exportType === 'year' && (
          <div className="mb-6">
            <label htmlFor="year" className="block text-sm font-medium text-stone-700 mb-2">
              Jahr
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={loadPreviewData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BarChart3 className="h-5 w-5" />
            )}
            <span>{loading ? 'Lade...' : 'Vorschau laden'}</span>
          </button>

          {previewData && (
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>{loading ? 'Exportiere...' : 'Excel Export'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Data */}
      {previewData && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <span>Zusammenfassung pro Eissorte</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {previewData.summary.map((item) => (
              <div
                key={item.flavorId}
                className={`bg-gradient-to-br ${item.color} rounded-xl p-4 border-2 border-white/50 shadow-lg`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-stone-800">{item.name}</h4>
                    <p className="text-sm text-stone-600">{item.count} Einträge</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Gesamt Netto:</span>
                    <span className="font-bold text-green-700">{Math.round(item.totalNet)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Gesamt Brutto:</span>
                    <span className="font-semibold text-blue-700">{Math.round(item.totalGross)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Ø Netto:</span>
                    <span className="font-medium text-amber-700">{Math.round(item.totalNet / item.count)}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-amber-300">
            <h4 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
              <span>🏆</span>
              <span>Gesamtübersicht</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {previewData.summary.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-sm text-stone-600">Einträge gesamt</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(previewData.summary.reduce((sum, item) => sum + item.totalNet, 0))}g
                </div>
                <div className="text-sm text-stone-600">Netto gesamt</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(previewData.summary.reduce((sum, item) => sum + item.totalGross, 0))}g
                </div>
                <div className="text-sm text-stone-600">Brutto gesamt</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {previewData.summary.length}
                </div>
                <div className="text-sm text-stone-600">Verschiedene Sorten</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Calendar className="h-6 w-6 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">Export-Informationen</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Die Excel-Datei enthält zwei Arbeitsblätter: "Zusammenfassung" und "Detaildaten"</li>
              <li>• Die Zusammenfassung zeigt Gesamtsummen pro Eissorte für den gewählten Zeitraum</li>
              <li>• Die Detaildaten enthalten alle einzelnen Gewichtseinträge</li>
              <li>• Alle Gewichte werden in Gramm angegeben (Brutto, Netto, Behälter)</li>
              <li>• Die Zusammenfassung ist nach Netto-Gesamtgewicht sortiert (höchste zuerst)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}