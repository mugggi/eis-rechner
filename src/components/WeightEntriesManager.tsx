import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Calendar, Scale, Download, Check, X, AlertTriangle } from 'lucide-react';
import { Business, WeightEntry, IceFlavor } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import WeightEntryEditor from './WeightEntryEditor';
import * as XLSX from 'xlsx';

interface WeightEntriesManagerProps {
  selectedBusiness: Business;
  allFlavors: IceFlavor[];
}

export default function WeightEntriesManager({ selectedBusiness, allFlavors }: WeightEntriesManagerProps) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [flavorFilter, setFlavorFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showMonthlyDelete, setShowMonthlyDelete] = useState(false);
  const [deleteMonth, setDeleteMonth] = useState('');
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear().toString());
  const [deletePassword, setDeletePassword] = useState('');
  const [monthlyDeleteLoading, setMonthlyDeleteLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedDeleteBusiness, setSelectedDeleteBusiness] = useState('');
  
  const { getWeightEntries, updateWeightEntry, deleteWeightEntry, deleteMonthlyEntries, getBusinesses } = useSupabase();

  useEffect(() => {
    loadEntries();
    loadBusinesses();
  }, [selectedBusiness.id]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getWeightEntries(selectedBusiness.id);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const businessData = await getBusinesses();
      setBusinesses(businessData);
      // Set current business as default selection
      setSelectedDeleteBusiness(selectedBusiness.id);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleUpdateEntry = async (updatedEntry: WeightEntry) => {
    try {
      await updateWeightEntry(updatedEntry);
      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      setEditingEntry(null);
      showNotification('success', 'Eintrag erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating entry:', error);
      showNotification('error', 'Fehler beim Aktualisieren');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteWeightEntry(entryId);
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      setEditingEntry(null);
      setDeleteConfirm(null);
      showNotification('success', 'Eintrag erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showNotification('error', 'Fehler beim Löschen');
    }
  };

  const handleMonthlyDelete = async () => {
    if (!deleteMonth || !deleteYear || !deletePassword || !selectedDeleteBusiness) {
      showNotification('error', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    // Passwort-Validierung
    if (deletePassword !== '123456') {
      showNotification('error', 'Falsches Passwort');
      return;
    }

    setMonthlyDeleteLoading(true);
    try {
      const deletedCount = await deleteMonthlyEntries(selectedDeleteBusiness, deleteMonth, deleteYear);
      
      // Reload entries if we deleted from the current business
      if (selectedDeleteBusiness === selectedBusiness.id) {
        await loadEntries();
      }
      
      // Reset form
      setShowMonthlyDelete(false);
      setDeleteMonth('');
      setDeletePassword('');
      setSelectedDeleteBusiness(selectedBusiness.id);
      
      const selectedBusinessName = businesses.find(b => b.id === selectedDeleteBusiness)?.name || 'Unbekanntes Geschäft';
      showNotification('success', `${deletedCount} Einträge für ${getMonthName(deleteMonth)} ${deleteYear} von ${selectedBusinessName} erfolgreich gelöscht`);
    } catch (error) {
      console.error('Error deleting monthly entries:', error);
      showNotification('error', 'Fehler beim Löschen der monatlichen Daten');
    } finally {
      setMonthlyDeleteLoading(false);
    }
  };

  const getMonthName = (monthNumber: string) => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const exportToExcel = () => {
    const filteredEntries = getFilteredEntries();
    
    if (filteredEntries.length === 0) {
      showNotification('error', 'Keine Daten zum Exportieren vorhanden');
      return;
    }

    try {
      // Create flavor name mapping
      const flavorNames: { [key: string]: string } = {};
      allFlavors.forEach(flavor => {
        flavorNames[flavor.id] = flavor.name;
      });

      // Prepare data for Excel
      const excelData = filteredEntries.map(entry => ({
        Datum: entry.date,
        Geschäft: selectedBusiness.name,
        Eissorte: flavorNames[entry.flavor_id] || entry.flavor_id,
        'Brutto-Gewicht (g)': entry.gross_weight,
        'Behälter-Gewicht (g)': entry.container_weight,
        'Netto-Gewicht (g)': entry.net_weight,
        Erstellt: new Date(entry.created_at!).toLocaleString('de-DE'),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Gewichtsdaten');

      // Generate filename
      const now = new Date();
      const filename = `${selectedBusiness.name}_Gewichtsdaten_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      showNotification('success', 'Export erfolgreich heruntergeladen');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotification('error', 'Fehler beim Export');
    }
  };

  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const matchesDate = !dateFilter || entry.date === dateFilter;
      const matchesFlavor = !flavorFilter || entry.flavor_id === flavorFilter;
      return matchesDate && matchesFlavor;
    });
  };

  const filteredEntries = getFilteredEntries();
  const totalNetWeight = filteredEntries.reduce((sum, entry) => sum + entry.net_weight, 0);

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-600">Lade Gewichtsdaten...</p>
      </div>
    );
  }

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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 mb-2">Eintrag löschen?</h2>
              <p className="text-stone-600 mb-6">
                Sind Sie sicher, dass Sie diesen Gewichtseintrag löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteEntry(deleteConfirm)}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Delete Modal */}
      {showMonthlyDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 mb-2">Monatliche Daten löschen</h2>
              <p className="text-stone-600 text-sm">
                ⚠️ ACHTUNG: Diese Aktion löscht ALLE Gewichtsdaten für den ausgewählten Monat und kann nicht rückgängig gemacht werden!
              </p>
            </div>

            <div className="space-y-4">
              {/* Business Selection */}
              <div>
                <label htmlFor="deleteBusiness" className="block text-sm font-medium text-stone-700 mb-2">
                  Geschäft auswählen
                </label>
                <select
                  id="deleteBusiness"
                  value={selectedDeleteBusiness}
                  onChange={(e) => setSelectedDeleteBusiness(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Geschäft auswählen</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.icon} {business.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selection */}
              <div>
                <label htmlFor="deleteMonth" className="block text-sm font-medium text-stone-700 mb-2">
                  Monat auswählen
                </label>
                <select
                  id="deleteMonth"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Monat auswählen</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selection */}
              <div>
                <label htmlFor="deleteYear" className="block text-sm font-medium text-stone-700 mb-2">
                  Jahr auswählen
                </label>
                <select
                  id="deleteYear"
                  value={deleteYear}
                  onChange={(e) => setDeleteYear(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="deletePassword" className="block text-sm font-medium text-stone-700 mb-2">
                  Passwort eingeben
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Lösch-Passwort eingeben"
                  required
                />
                <p className="text-xs text-stone-500 mt-1">
                  Geben Sie das Lösch-Passwort ein (6 Ziffern)
                </p>
              </div>

              {/* Confirmation Text */}
              {deleteMonth && deleteYear && selectedDeleteBusiness && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">
                    Sie sind dabei, ALLE Daten für {getMonthName(deleteMonth)} {deleteYear} von{' '}
                    <span className="font-bold">
                      {businesses.find(b => b.id === selectedDeleteBusiness)?.name || 'Unbekanntes Geschäft'}
                    </span>{' '}
                    zu löschen!
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMonthlyDelete(false);
                  setDeleteMonth('');
                  setDeletePassword('');
                  setSelectedDeleteBusiness(selectedBusiness.id);
                }}
                className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleMonthlyDelete}
                disabled={monthlyDeleteLoading || !deleteMonth || !deleteYear || !deletePassword || !selectedDeleteBusiness}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {monthlyDeleteLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Monat löschen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-amber-600" />
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Gewichtsdaten verwalten</h2>
              <p className="text-stone-600">Bearbeiten und löschen Sie eingetragene Gewichtsdaten</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowMonthlyDelete(true)}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span>Monat löschen</span>
            </button>
            <button
              onClick={exportToExcel}
              disabled={filteredEntries.length === 0}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-stone-700 mb-2">
              Nach Datum filtern
            </label>
            <input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="flavorFilter" className="block text-sm font-medium text-stone-700 mb-2">
              Nach Eissorte filtern
            </label>
            <select
              id="flavorFilter"
              value={flavorFilter}
              onChange={(e) => setFlavorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Alle Sorten</option>
              {allFlavors.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.icon} {flavor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter('');
                setFlavorFilter('');
              }}
              className="w-full px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex justify-between items-center">
            <span className="text-amber-800 font-medium">
              {filteredEntries.length} Einträge gefunden
            </span>
            <span className="text-amber-600 font-bold">
              Gesamt: {Math.round(totalNetWeight)}g Netto
            </span>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-100">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <Scale className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-stone-600 mb-2">
              {entries.length === 0 ? 'Keine Gewichtsdaten vorhanden' : 'Keine Einträge gefunden'}
            </h3>
            <p className="text-stone-400">
              {entries.length === 0 
                ? 'Beginnen Sie mit der Erfassung von Gewichtsdaten im Rechner'
                : 'Versuchen Sie andere Filtereinstellungen'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-stone-700">Datum</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-stone-700">Eissorte</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Brutto (g)</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Behälter (g)</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Netto (g)</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-stone-700">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredEntries.map((entry) => {
                  const flavor = allFlavors.find(f => f.id === entry.flavor_id);
                  const formattedDate = new Date(entry.date).toLocaleDateString('de-DE');
                  
                  return (
                    <tr key={entry.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-stone-400" />
                          <span className="text-sm font-medium text-stone-800">{formattedDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {flavor ? (
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${flavor.color} flex items-center justify-center text-sm`}>
                              {flavor.icon}
                            </div>
                            <span className="font-medium text-stone-800">{flavor.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-500">Unbekannte Sorte</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-600 font-semibold">{Math.round(entry.gross_weight)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-stone-600">{Math.round(entry.container_weight)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-600 font-bold">{Math.round(entry.net_weight)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(entry.id!)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Edit Modal */}
      {editingEntry && (
        <WeightEntryEditor
          entry={editingEntry}
          allFlavors={allFlavors}
          onSave={handleUpdateEntry}
          onDelete={handleDeleteEntry}
          onCancel={() => setEditingEntry(null)}
          loading={loading}
        />
      )}
    </div>
  );
}