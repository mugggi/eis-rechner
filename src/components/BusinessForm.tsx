import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Business } from '../types';

interface BusinessFormProps {
  business?: Business | null;
  onSave: (business: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const colorOptions = [
  { name: 'Warmes Beige', value: 'from-stone-200 to-stone-300' },
  { name: 'Sanftes Orange', value: 'from-orange-200 to-orange-300' },
  { name: 'Helles Amber', value: 'from-amber-200 to-amber-300' },
  { name: 'Cremiges Gelb', value: 'from-yellow-200 to-yellow-300' },
  { name: 'Zartes Rosa', value: 'from-rose-200 to-rose-300' },
  { name: 'Minzgrün', value: 'from-emerald-200 to-emerald-300' },
  { name: 'Himmelblau', value: 'from-sky-200 to-sky-300' },
  { name: 'Lavendel', value: 'from-purple-200 to-purple-300' },
];

const iconOptions = ['🏪', '🏬', '🏢', '🏭', '🏛️', '🏦', '🏨', '🏪', '🎪', '🏖️', '⭐', '💎'];

export default function BusinessForm({ business, onSave, onCancel, loading }: BusinessFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [icon, setIcon] = useState(iconOptions[0]);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setDescription(business.description);
      setColor(business.color);
      setIcon(business.icon);
    }
  }, [business]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const businessData = {
      ...business,
      name,
      description,
      color,
      icon,
      is_active: true,
    };

    onSave(businessData);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800">
            {business ? 'Geschäft bearbeiten' : 'Neues Geschäft erstellen'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
              Geschäftsname
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="z.B. Hauptfiliale, Stadtmitte, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
              placeholder="Kurze Beschreibung des Geschäfts..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Symbol auswählen
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  onClick={() => setIcon(iconOption)}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                    icon === iconOption
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Farbe auswählen
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`h-12 rounded-lg border-2 bg-gradient-to-br ${colorOption.value} transition-all ${
                    color === colorOption.value
                      ? 'border-stone-800'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <div className="text-center mb-4">
              <p className="text-sm text-stone-600 mb-3">Vorschau:</p>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl mx-auto`}>
                {icon}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="flex-1 bg-amber-500 text-white px-4 py-3 rounded-lg hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {business ? 'Aktualisieren' : 'Erstellen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}