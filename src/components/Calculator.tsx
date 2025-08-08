import React, { useState } from 'react';
import { Save, Trash2, Check } from 'lucide-react';
import { IceFlavor, Business, WeightEntry } from '../types';
import { useSupabase } from '../hooks/useSupabase';

interface CalculatorProps {
  selectedFlavor: IceFlavor;
  selectedBusiness: Business;
  onClose: () => void;
  onSave?: () => void;
}

export default function Calculator({ selectedFlavor, selectedBusiness, onClose, onSave }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { saveWeightEntry } = useSupabase();

  const CONTAINER_WEIGHT = 700; // Standard container weight in grams

  const inputNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const clear = () => {
    setDisplay('0');
    setShowSuccess(false);
  };

  const handleSave = async () => {
    const grossWeight = parseFloat(display);
    if (isNaN(grossWeight) || grossWeight <= CONTAINER_WEIGHT) {
      return; // Silently fail for invalid input
    }

    setSaving(true);
    try {
      const entry: WeightEntry = {
        business_id: selectedBusiness.id,
        flavor_id: selectedFlavor.id,
        gross_weight: grossWeight,
        net_weight: grossWeight - CONTAINER_WEIGHT,
        container_weight: CONTAINER_WEIGHT,
        date: new Date().toISOString().split('T')[0],
      };

      await saveWeightEntry(entry);
      
      // Zeige Erfolgsbestätigung
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      clear();
      
      // Callback aufrufen um die Verkäufe zu aktualisieren
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving weight entry:', error);
      // No alert - just log the error
    } finally {
      setSaving(false);
    }
  };

  const grossWeight = parseFloat(display) || 0;
  const netWeight = Math.max(0, grossWeight - CONTAINER_WEIGHT);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
          <div className="bg-green-500 rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-green-800 font-medium">Erfolgreich gespeichert!</p>
            <p className="text-green-600 text-sm">
              Brutto: {grossWeight}g • Netto: {grossWeight - CONTAINER_WEIGHT}g
            </p>
          </div>
        </div>
      )}

      {/* Weight Display */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="text-center mb-2">
          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
            <span className="text-sm font-medium">⚖️ Gesamtgewicht</span>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-2">{grossWeight.toFixed(0)}g</div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-center text-amber-700">
            <div className="text-sm mb-1">{grossWeight.toFixed(0)}g - 700g (Behälter) =</div>
            <div className="text-2xl font-bold text-amber-600">{netWeight.toFixed(0)}g</div>
            <div className="text-sm font-medium">Netto Eisgewicht</div>
          </div>
        </div>
      </div>

      {/* Calculator Buttons - Beige statt Gelb */}
      <div className="grid grid-cols-3 gap-3">
        {/* Numbers 1-9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => inputNumber(num.toString())}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xl py-4 rounded-lg transition-all duration-200 active:scale-95 shadow-lg border border-stone-300"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bottom row with 0 and delete */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => inputNumber('0')}
          className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xl py-4 rounded-lg transition-all duration-200 active:scale-95 shadow-lg border border-stone-300"
        >
          0
        </button>
        <button
          onClick={clear}
          className="bg-red-300 hover:bg-red-400 text-stone-800 font-bold text-xl py-4 rounded-lg transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center border border-red-400"
        >
          <Trash2 className="h-6 w-6" />
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || grossWeight <= CONTAINER_WEIGHT}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg hover:from-green-600 hover:to-emerald-600 focus:ring-4 focus:ring-green-300 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
      >
        {saving ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Save className="h-6 w-6 mr-3" />
            Bestätigen
          </>
        )}
      </button>

      {/* Info Text wie im Bild */}
      {grossWeight > 0 && (
        <div className="text-center text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
          <div className="font-medium">
            💡 Tipp: Geben Sie das komplette Gewicht ein - 700g Behältergewicht wird automatisch abgezogen!
          </div>
        </div>
      )}
    </div>
  );
}