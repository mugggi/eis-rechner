import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { CustomerProfile } from '../types';

interface ProfileFormProps {
  profile?: CustomerProfile | null;
  onSave: (profile: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const colorOptions = [
  { name: 'Orange', value: 'from-orange-400 to-orange-500' },
  { name: 'Blau', value: 'from-blue-400 to-blue-500' },
  { name: 'Grün', value: 'from-green-400 to-green-500' },
  { name: 'Lila', value: 'from-purple-400 to-purple-500' },
  { name: 'Rosa', value: 'from-pink-400 to-pink-500' },
  { name: 'Gelb', value: 'from-yellow-400 to-yellow-500' },
  { name: 'Rot', value: 'from-red-400 to-red-500' },
  { name: 'Türkis', value: 'from-teal-400 to-teal-500' },
];

const iconOptions = ['🏪', '🍦', '🎪', '🏖️', '🎠', '🎈', '⭐', '🌟', '💎', '🎯', '🎊', '🎉'];

export default function ProfileForm({ profile, onSave, onCancel, loading }: ProfileFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [icon, setIcon] = useState(iconOptions[0]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description);
      setColor(profile.color);
      setIcon(profile.icon);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = {
      ...profile,
      name,
      description,
      color,
      icon,
      is_active: true,
    };

    onSave(profileData);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {profile ? 'Profil bearbeiten' : 'Neues Profil erstellen'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Profilname
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="z.B. Hauptstand, Strandverkauf, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
              placeholder="Kurze Beschreibung des Verkaufsstandorts..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      ? 'border-gray-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-3">Vorschau:</p>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl mx-auto`}>
                {icon}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
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
                  {profile ? 'Aktualisieren' : 'Erstellen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}