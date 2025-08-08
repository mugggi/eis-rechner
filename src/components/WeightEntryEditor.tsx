import React, { useState, useEffect } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { WeightEntry, IceFlavor } from '../types';

interface WeightEntryEditorProps {
  entry: WeightEntry;
  allFlavors: IceFlavor[];
  onSave: (entry: WeightEntry) => void;
  onDelete: (entryId: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function WeightEntryEditor({
  entry,
  allFlavors,
  onSave,
  onDelete,
  onCancel,
  loading
}: WeightEntryEditorProps) {
  const [flavorId, setFlavorId] = useState(entry.flavor_id);
  const [grossWeight, setGrossWeight] = useState(entry.gross_weight.toString());
  const [containerWeight, setContainerWeight] = useState(entry.container_weight.toString());
  const [date, setDate] = useState(entry.date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const grossWeightNum = parseFloat(grossWeight);
    const containerWeightNum = parseFloat(containerWeight);
    
    if (isNaN(grossWeightNum) || isNaN(containerWeightNum)) {
      return; // Silently fail for invalid input
    }
    
    if (grossWeightNum <= containerWeightNum) {
      return; // Silently fail for invalid weight
    }

    const updatedEntry: WeightEntry = {
      ...entry,
      flavor_id: flavorId,
      gross_weight: grossWeightNum,
      container_weight: containerWeightNum,
      net_weight: grossWeightNum - containerWeightNum,
      date: date
    };

    onSave(updatedEntry);
  };

  const handleDelete = () => {
    onDelete(entry.id!);
  };

  const selectedFlavor = allFlavors.find(f => f.id === flavorId);
  const netWeight = parseFloat(grossWeight) - parseFloat(containerWeight);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {showDeleteConfirm ? (
          // Delete Confirmation
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 mb-2">Eintrag löschen?</h2>
              <p className="text-stone-600">
                Sind Sie sicher, dass Sie diesen Gewichtseintrag löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Löschen
              </button>
            </div>
          </div>
        ) : (
          // Edit Form
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800">Eintrag bearbeiten</h2>
              <button
                onClick={onCancel}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flavor Selection */}
              <div>
                <label htmlFor="flavor" className="block text-sm font-medium text-stone-700 mb-2">
                  Eissorte
                </label>
                <select
                  id="flavor"
                  value={flavorId}
                  onChange={(e) => setFlavorId(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  {allFlavors.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.icon} {flavor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-2">
                  Datum
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Gross Weight */}
              <div>
                <label htmlFor="grossWeight" className="block text-sm font-medium text-stone-700 mb-2">
                  Bruttogewicht (g)
                </label>
                <input
                  id="grossWeight"
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="z.B. 1200"
                  required
                  min="1"
                  step="1"
                />
              </div>

              {/* Container Weight */}
              <div>
                <label htmlFor="containerWeight" className="block text-sm font-medium text-stone-700 mb-2">
                  Behältergewicht (g)
                </label>
                <input
                  id="containerWeight"
                  type="number"
                  value={containerWeight}
                  onChange={(e) => setContainerWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="z.B. 700"
                  required
                  min="1"
                  step="1"
                />
              </div>

              {/* Net Weight Preview */}
              {!isNaN(netWeight) && netWeight > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-800">Nettogewicht:</span>
                    <span className="text-lg font-bold text-amber-600">{netWeight.toFixed(0)}g</span>
                  </div>
                  {selectedFlavor && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedFlavor.color} flex items-center justify-center text-sm`}>
                        {selectedFlavor.icon}
                      </div>
                      <span className="text-sm text-amber-700">{selectedFlavor.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Löschen</span>
                </button>
                
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Abbrechen
                </button>
                
                <button
                  type="submit"
                  disabled={loading || isNaN(netWeight) || netWeight <= 0}
                  className="flex-1 bg-amber-500 text-white px-4 py-3 rounded-lg hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Speichern
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}