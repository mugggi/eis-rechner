import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Settings, Scale, Sparkles, Trash2, Check, X, Edit } from 'lucide-react';
import { Business, IceFlavor, CustomFlavor, WeightEntry } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import FlavorManager from './FlavorManager';
import Calculator from './Calculator';
import ExportManager from './ExportManager';
import WeightEntriesManager from './WeightEntriesManager';

interface IceCalculatorProps {
  onLogout: () => void;
  selectedBusiness: Business;
  onBackToBusiness: () => void;
}

type View = 'calculator' | 'flavors' | 'export' | 'entries';

export default function IceCalculator({ onLogout, selectedBusiness, onBackToBusiness }: IceCalculatorProps) {
  const [currentView, setCurrentView] = useState<View>('calculator');
  const [selectedFlavor, setSelectedFlavor] = useState<IceFlavor | null>(null);
  const [customFlavors, setCustomFlavors] = useState<CustomFlavor[]>([]);
  const [allFlavors, setAllFlavors] = useState<IceFlavor[]>([]);
  const [todaysSales, setTodaysSales] = useState<WeightEntry[]>([]);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { getCustomFlavors, deleteCustomFlavor, getWeightEntries } = useSupabase();

  useEffect(() => {
    loadCustomFlavors();
    loadTodaysSales();
  }, []);

  useEffect(() => {
    // Nur benutzerdefinierte Sorten anzeigen
    const combined: IceFlavor[] = customFlavors.map(cf => ({
      id: cf.id!,
      name: cf.name,
      icon: cf.icon,
      color: cf.color,
      isCustom: true,
    }));
    setAllFlavors(combined);
  }, [customFlavors]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadCustomFlavors = async () => {
    try {
      const flavors = await getCustomFlavors();
      setCustomFlavors(flavors);
    } catch (error) {
      console.error('Error loading custom flavors:', error);
    }
  };

  const loadTodaysSales = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const entries = await getWeightEntries(selectedBusiness.id, { 
        startDate: today, 
        endDate: today 
      });
      setTodaysSales(entries);
    } catch (error) {
      console.error('Error loading today sales:', error);
    }
  };

  const handleDeleteFlavor = async (flavorId: string) => {
    try {
      await deleteCustomFlavor(flavorId);
      setCustomFlavors(prev => prev.filter(f => f.id !== flavorId));
      setDeleteConfirm(null);
      
      // Wenn die gelöschte Sorte ausgewählt war, Auswahl zurücksetzen
      if (selectedFlavor?.id === flavorId) {
        setSelectedFlavor(null);
      }
      
      showNotification('success', 'Eissorte erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting flavor:', error);
      showNotification('error', 'Fehler beim Löschen der Eissorte');
    }
  };

  const handleExport = () => {
    setCurrentView('export');
  };

  const getTodaysSalesForFlavor = (flavorId: string) => {
    return todaysSales
      .filter(entry => entry.flavor_id === flavorId)
      .reduce((total, entry) => total + entry.net_weight, 0);
  };

  const getTotalTodaysSales = () => {
    return todaysSales.reduce((total, entry) => total + entry.net_weight, 0);
  };

  const navigationItems = [
    { id: 'calculator', label: 'Rechner', icon: Scale },
    { id: 'entries', label: 'Mengen bearbeiten', icon: Edit },
    { id: 'flavors', label: 'Sorten verwalten', icon: Settings },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calculator':
        return (
          <div className="space-y-6">
            {/* Main Layout - Breiter links, schmaler rechts */}
            <div className={`grid gap-8 ${selectedFlavor ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {/* Ice Flavors Section - 2/3 der Breite */}
              <div className={selectedFlavor ? 'lg:col-span-2' : 'col-span-1'}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-stone-800">Eissorten auswählen</h2>
                    <button
                      onClick={() => setCurrentView('flavors')}
                      className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Neue Sorte</span>
                    </button>
                  </div>
                  
                  {allFlavors.length === 0 ? (
                    <div className="text-center py-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300">
                      <div className="text-6xl mb-4">🍦</div>
                      <h3 className="text-xl font-semibold text-stone-600 mb-2">Keine Eissorten vorhanden</h3>
                      <p className="text-stone-500 mb-6">Erstellen Sie Ihre ersten Eissorten, um zu beginnen</p>
                      <button
                        onClick={() => setCurrentView('flavors')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg"
                      >
                        Erste Eissorte erstellen
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {allFlavors.map((flavor) => {
                        const todaysSalesAmount = getTodaysSalesForFlavor(flavor.id);
                        return (
                          <div
                            key={flavor.id}
                            onClick={() => setSelectedFlavor(flavor)}
                            className={`relative group cursor-pointer bg-gradient-to-br ${flavor.color} rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 ${
                              selectedFlavor?.id === flavor.id 
                                ? 'border-amber-400 ring-4 ring-amber-200 shadow-2xl scale-105' 
                                : 'border-white/50 hover:border-white'
                            }`}
                          >
                            {/* Selected indicator */}
                            {selectedFlavor?.id === flavor.id && (
                              <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                Ausgewählt
                              </div>
                            )}
                            
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(flavor.id);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110"
                              title="Eissorte löschen"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            
                            {/* Icon */}
                            <div className="text-4xl mb-3 filter drop-shadow-lg">
                              {flavor.icon}
                            </div>
                            
                            {/* Name */}
                            <h3 className="font-bold text-stone-800 text-lg mb-2 leading-tight">
                              {flavor.name}
                            </h3>
                            
                            {/* Sales info */}
                            <div className="text-sm text-stone-600">
                              <div className="font-semibold">{Math.round(todaysSalesAmount)}g</div>
                              <div className="text-xs">verkauft heute</div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add new flavor card */}
                      <div
                        onClick={() => setCurrentView('flavors')}
                        className="cursor-pointer bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 border-dashed border-stone-400 hover:border-stone-500"
                      >
                        <div className="text-4xl mb-3 text-stone-500">
                          ➕
                        </div>
                        <h3 className="font-bold text-stone-700 text-lg mb-2">
                          Neue Sorte
                        </h3>
                        <div className="text-sm text-stone-600">
                          <div className="font-semibold">Hinzufügen</div>
                          <div className="text-xs">Eigene Eissorte</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculator Section - 1/3 der Breite */}
              {selectedFlavor && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-stone-800 mb-2">Gesamtgewicht eingeben</h2>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedFlavor.color} flex items-center justify-center text-xl`}>
                          {selectedFlavor.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-stone-800">{selectedFlavor.name}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <Calculator
                      selectedFlavor={selectedFlavor}
                      selectedBusiness={selectedBusiness}
                      onClose={() => setSelectedFlavor(null)}
                      onSave={loadTodaysSales}
                    />
                  </div>
                </div>
              )}

              {/* Placeholder when no flavor selected */}
              {!selectedFlavor && (
                <div className="col-span-1">
                  <div className="bg-stone-50 rounded-2xl p-16 text-center border-2 border-dashed border-stone-300 sticky top-4">
                    <div className="text-6xl mb-4 text-stone-400">🍦</div>
                    <h3 className="text-xl font-semibold text-stone-600 mb-2">Sorte auswählen</h3>
                    <p className="text-stone-500">
                      Wählen Sie eine Eissorte aus, um das Gesamtgewicht einzugeben
                    </p>
                    <div className="mt-4 text-sm text-stone-400">
                      💡 Tipp: Geben Sie das komplette Gewicht ein - 700g Behältergewicht wird automatisch abgezogen!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verkäufe heute Section */}
            {todaysSales.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-stone-800">Verkäufe heute</h3>
                  <button
                    onClick={() => setCurrentView('entries')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Bearbeiten
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {todaysSales.map((entry) => {
                    const flavor = allFlavors.find(f => f.id === entry.flavor_id);
                    if (!flavor) return null;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`bg-gradient-to-br ${flavor.color} rounded-xl p-4 text-center border-2 border-white/50`}
                      >
                        <div className="text-2xl mb-2">{flavor.icon}</div>
                        <h4 className="font-bold text-stone-800 text-sm mb-1">{flavor.name}</h4>
                        <div className="text-xs text-stone-600">
                          <div className="font-semibold">{Math.round(entry.net_weight)}g</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      case 'entries':
        return <WeightEntriesManager selectedBusiness={selectedBusiness} allFlavors={allFlavors} />;
      case 'flavors':
        return <FlavorManager onFlavorsUpdate={loadCustomFlavors} />;
      case 'export':
        return <ExportManager selectedBusiness={selectedBusiness} allFlavors={allFlavors} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
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
              <h2 className="text-xl font-bold text-stone-800 mb-2">Eissorte löschen?</h2>
              <p className="text-stone-600 mb-6">
                Sind Sie sicher, dass Sie diese Eissorte löschen möchten? 
                Alle zugehörigen Gewichtsdaten bleiben erhalten.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteFlavor(deleteConfirm)}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Beige-Weiß statt Orange */}
      <div className="bg-gradient-to-r from-stone-100 via-stone-50 to-white text-stone-800 shadow-xl border-b border-stone-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBackToBusiness}
                className="flex items-center space-x-3 text-stone-600 hover:text-stone-800 transition-colors bg-stone-200/50 hover:bg-stone-200 rounded-lg px-4 py-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="font-medium">Zurück</span>
              </button>
              <div className="h-8 w-px bg-stone-300" />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedBusiness.color} flex items-center justify-center text-xl shadow-lg border-2 border-stone-300`}>
                  {selectedBusiness.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-800">Eisverkauf {selectedBusiness.name}</h1>
                  <div className="flex items-center space-x-4 text-stone-600">
                    <span>Kunde 1</span>
                    <span>Montag, 30. Juni 2025</span>
                    <button 
                      onClick={handleExport}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Export
                    </button>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                      {Math.round(getTotalTodaysSales())}g heute
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                      Jon Avdiu
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    currentView === item.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-stone-600 hover:text-stone-800 hover:border-stone-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}