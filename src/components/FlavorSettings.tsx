import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Trash2, Save, Check, X } from 'lucide-react';
import { IceFlavor, CustomFlavor } from '../types';
import { useSupabase } from '../hooks/useSupabase';

const colorOptions = [
  // === WARME FARBEN ===
  'from-amber-100 to-amber-200',
  'from-amber-200 to-amber-300',
  'from-amber-300 to-amber-400',
  'from-orange-100 to-orange-200',
  'from-orange-200 to-orange-300',
  'from-orange-300 to-orange-400',
  'from-yellow-100 to-yellow-200',
  'from-yellow-200 to-yellow-300',
  'from-yellow-300 to-yellow-400',
  'from-red-100 to-red-200',
  'from-red-200 to-red-300',
  'from-red-300 to-red-400',
  
  // === ROSA & PINK ===
  'from-rose-100 to-rose-200',
  'from-rose-200 to-rose-300',
  'from-rose-300 to-rose-400',
  'from-pink-100 to-pink-200',
  'from-pink-200 to-pink-300',
  'from-pink-300 to-pink-400',
  'from-fuchsia-100 to-fuchsia-200',
  'from-fuchsia-200 to-fuchsia-300',
  'from-fuchsia-300 to-fuchsia-400',
  
  // === LILA & VIOLETT ===
  'from-purple-100 to-purple-200',
  'from-purple-200 to-purple-300',
  'from-purple-300 to-purple-400',
  'from-violet-100 to-violet-200',
  'from-violet-200 to-violet-300',
  'from-violet-300 to-violet-400',
  'from-indigo-100 to-indigo-200',
  'from-indigo-200 to-indigo-300',
  'from-indigo-300 to-indigo-400',
  
  // === BLAU ===
  'from-blue-100 to-blue-200',
  'from-blue-200 to-blue-300',
  'from-blue-300 to-blue-400',
  'from-sky-100 to-sky-200',
  'from-sky-200 to-sky-300',
  'from-sky-300 to-sky-400',
  'from-cyan-100 to-cyan-200',
  'from-cyan-200 to-cyan-300',
  'from-cyan-300 to-cyan-400',
  
  // === GRÜN ===
  'from-emerald-100 to-emerald-200',
  'from-emerald-200 to-emerald-300',
  'from-emerald-300 to-emerald-400',
  'from-green-100 to-green-200',
  'from-green-200 to-green-300',
  'from-green-300 to-green-400',
  'from-lime-100 to-lime-200',
  'from-lime-200 to-lime-300',
  'from-lime-300 to-lime-400',
  'from-teal-100 to-teal-200',
  'from-teal-200 to-teal-300',
  'from-teal-300 to-teal-400',
  
  // === NEUTRALE FARBEN ===
  'from-stone-100 to-stone-200',
  'from-stone-200 to-stone-300',
  'from-stone-300 to-stone-400',
  'from-slate-100 to-slate-200',
  'from-slate-200 to-slate-300',
  'from-slate-300 to-slate-400',
  'from-gray-100 to-gray-200',
  'from-gray-200 to-gray-300',
  'from-gray-300 to-gray-400',
  'from-zinc-100 to-zinc-200',
  'from-zinc-200 to-zinc-300',
  'from-zinc-300 to-zinc-400',
  'from-neutral-100 to-neutral-200',
  'from-neutral-200 to-neutral-300',
  'from-neutral-300 to-neutral-400',
  
  // === SPEZIELLE KOMBINATIONEN ===
  'from-red-200 to-pink-200',
  'from-pink-200 to-purple-200',
  'from-purple-200 to-blue-200',
  'from-blue-200 to-cyan-200',
  'from-cyan-200 to-teal-200',
  'from-teal-200 to-green-200',
  'from-green-200 to-lime-200',
  'from-lime-200 to-yellow-200',
  'from-yellow-200 to-orange-200',
  'from-orange-200 to-red-200',
  
  // === REGENBOGEN KOMBINATIONEN ===
  'from-red-100 to-orange-100',
  'from-orange-100 to-yellow-100',
  'from-yellow-100 to-green-100',
  'from-green-100 to-blue-100',
  'from-blue-100 to-purple-100',
  'from-purple-100 to-pink-100',
  
  // === PASTELL KOMBINATIONEN ===
  'from-rose-50 to-pink-100',
  'from-pink-50 to-purple-100',
  'from-purple-50 to-blue-100',
  'from-blue-50 to-cyan-100',
  'from-cyan-50 to-teal-100',
  'from-teal-50 to-green-100',
  'from-green-50 to-lime-100',
  'from-lime-50 to-yellow-100',
  'from-yellow-50 to-orange-100',
  'from-orange-50 to-red-100',
  
  // === INTENSIVE FARBEN ===
  'from-red-400 to-red-500',
  'from-orange-400 to-orange-500',
  'from-yellow-400 to-yellow-500',
  'from-green-400 to-green-500',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-indigo-400 to-indigo-500',
  'from-cyan-400 to-cyan-500',
  'from-teal-400 to-teal-500',
  'from-lime-400 to-lime-500',
  'from-emerald-400 to-emerald-500',
  
  // === DUNKLE KOMBINATIONEN ===
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-green-500 to-green-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-cyan-500 to-cyan-600',
  'from-teal-500 to-teal-600',
  'from-lime-500 to-lime-600',
  'from-emerald-500 to-emerald-600',
  
  // === DREIFACH KOMBINATIONEN ===
  'from-red-200 via-pink-200 to-purple-200',
  'from-blue-200 via-cyan-200 to-teal-200',
  'from-green-200 via-lime-200 to-yellow-200',
  'from-yellow-200 via-orange-200 to-red-200',
  'from-purple-200 via-blue-200 to-cyan-200',
  'from-pink-200 via-rose-200 to-red-200',
  'from-teal-200 via-green-200 to-lime-200',
  'from-indigo-200 via-purple-200 to-pink-200',
  'from-cyan-200 via-blue-200 to-indigo-200',
  'from-lime-200 via-yellow-200 to-orange-200',
  
  // === SONNENUNTERGANG FARBEN ===
  'from-orange-300 via-red-300 to-pink-300',
  'from-yellow-300 via-orange-300 to-red-300',
  'from-pink-300 via-purple-300 to-indigo-300',
  'from-red-300 via-orange-300 to-yellow-300',
  
  // === OZEAN FARBEN ===
  'from-blue-300 via-cyan-300 to-teal-300',
  'from-cyan-300 via-blue-300 to-indigo-300',
  'from-teal-300 via-cyan-300 to-blue-300',
  'from-indigo-300 via-blue-300 to-cyan-300',
  
  // === NATUR FARBEN ===
  'from-green-300 via-emerald-300 to-teal-300',
  'from-lime-300 via-green-300 to-emerald-300',
  'from-emerald-300 via-teal-300 to-cyan-300',
  'from-yellow-300 via-lime-300 to-green-300',
  
  // === BEEREN FARBEN ===
  'from-purple-300 via-fuchsia-300 to-pink-300',
  'from-red-300 via-rose-300 to-pink-300',
  'from-fuchsia-300 via-purple-300 to-violet-300',
  'from-rose-300 via-pink-300 to-fuchsia-300',
];

// Umfangreiche Eis-relevante Emoji-Sammlung - nur Desserts, Früchte, Süßigkeiten, Gummibärchen und Nüsse
const emojiOptions = [
  // === EIS & FROZEN DESSERTS ===
  '🍦', '🍧', '🧊', '❄️', '☃️', '⛄',
  
  // === DESSERTS & KUCHEN ===
  '🧁', '🍰', '🎂', '🍪', '🍫', '🍬', '🍭', '🍩',
  '🥧', '🍮', '🍯', '🧈', '🥛', '🍼', '🍡', '🥮',
  '🍘', '🍙', '🍚', '🥞', '🧇', '🍞', '🥖', '🥨',
  
  // === SÜSSIGKEITEN & GUMMIBÄRCHEN ===
  '🍬', '🍭', '🍫', '🧁', '🍪', '🍩', '🎂', '🍰',
  '🧈', '🍯', '🍡', '🥮', '🍘', '🍙', '🍚', '🥞',
  '🧇', '🍞', '🥖', '🥨', '🥯', '🥐', '🍢', '🍣',
  
  // === FRÜCHTE (für Eissorten) ===
  '🍒', '🍓', '🥝', '🍊', '🍋', '🍌', '🥭', '🍑',
  '🍇', '🫐', '🥥', '🍍', '🍎', '🍏', '🍐', '🍈',
  '🍉', '🥑', '🫒', '🍅', '🥕', '🌽', '🥒', '🥔',
  '🧄', '🧅', '🫑', '🥬', '🥦', '🍄', '🌶️', '🫚',
  '🥜', '🌰', '🥔', '🍠', '🫘', '🌾', '🌿', '🍀',
  
  // === NÜSSE & SAMEN ===
  '🌰', '🥜', '🌻', '🌱', '🍄', '🧄', '🧅', '🥔',
  '🌾', '🌿', '🍀', '🌵', '🌲', '🌳', '🌴', '🌱',
  '🫘', '🥔', '🍠', '🫚', '🧄', '🧅', '🥬', '🥦',
  
  // === GETRÄNKE & MILCHPRODUKTE ===
  '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🥂',
  '🍷', '🍸', '🍹', '🍺', '🥃', '🧊', '💧', '🫖',
  '🥛', '🧀', '🍼', '🥄', '🍴', '🥢', '🔪', '🍽️',
  
  // === SÜSSE SYMBOLE & STERNE ===
  '⭐', '🌟', '✨', '💫', '🌠', '💎', '💍', '👑',
  '🎖️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎗️', '🔮',
  
  // === HERZEN (für süße Sorten) ===
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💕', '💖', '💗', '💘', '💝', '💞', '💟',
  
  // === BLUMEN (für florale Eissorten) ===
  '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌿',
  '🍀', '🌾', '🌵', '🌱', '🌲', '🌳', '🌴', '🌿',
  '🌊', '🏖️', '🏝️', '🗻', '🏔️', '⛰️', '🌋', '🏕️',
  
  // === SÜSSE TIERE (Bienen, Schmetterlinge etc.) ===
  '🐝', '🦋', '🐞', '🐛', '🦗', '🐨', '🐼', '🦊',
  '🐱', '🐶', '🐰', '🐹', '🐭', '🐯', '🦁', '🦄',
  '🐉', '🦚', '🦜', '🦢', '🕊️', '🦅', '🦆', '🐙',
  '🦀', '🦞', '🐠', '🐟', '🐡', '🦈', '🐳', '🐬',
  
  // === SÜSSE OBJEKTE ===
  '🎈', '🎀', '🎁', '🎊', '🎉', '🎯', '🎪', '🎨',
  '🎭', '🎠', '🎡', '🎢', '🎳', '🎲', '🃏', '🀄',
  '🎴', '🧩', '🎮', '🕹️', '🎯', '🎱', '🎰', '🎪',
  
  // === GEOMETRISCHE FORMEN (für moderne Sorten) ===
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪',
  '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠',
  '◆', '◇', '◈', '◉', '◎', '●', '○', '◐', '◑',
  
  // === WEITERE SÜSSE SYMBOLE ===
  '🌀', '💥', '💢', '💨', '💤', '💦', '💧', '🌊',
  '🔥', '💰', '💳', '🎖️', '🏆', '🥇', '🥈', '🥉',
  '🏅', '🎗️', '🔮', '💎', '💍', '👑', '🎭', '🎨',
  
  // === MOND & HIMMEL (für Nacht-Desserts) ===
  '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔',
  '🌙', '🌈', '☁️', '⚡', '☀️', '🌤️', '⛅', '🌦️',
  '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️',
  
  // === MUSIK (für besondere Sorten) ===
  '🎵', '🎶', '🎼', '🎹', '🥁', '🎸', '🎺', '🎷',
  '🎻', '🪕', '🎤', '🎧', '📻', '🎚️', '🎛️', '🔊',
  
  // === SPEZIELLE ZEICHEN ===
  '🔥', '💰', '💳', '🎮', '🎲', '🧩', '🃏', '🀄',
  '🎴', '🔬', '🔭', '📡', '💻', '📱', '⌚', '📷',
  '📸', '📹', '📽️', '🎞️', '📺', '📻', '🎙️', '🎚️',
  
  // === ZUSÄTZLICHE DESSERT-EMOJIS ===
  '🥨', '🥯', '🥐', '🍢', '🍣', '🍤', '🍥', '🥮',
  '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍞', '🥖',
  '🧀', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖', '🌭',
  '🍕', '🌮', '🌯', '🥙', '🥪', '🌭', '🍟', '🍔',
  
  // === WEITERE FRÜCHTE & BEEREN ===
  '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎',
  '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅',
  '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️',
  '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜',
  
  // === SÜSSE GETRÄNKE ===
  '🍼', '🥛', '☕', '🍵', '🧃', '🥤', '🧋', '🍶',
  '🍾', '🥂', '🍷', '🍸', '🍹', '🍺', '🥃', '🧊',
  '💧', '🫖', '🥄', '🍴', '🥢', '🔪', '🍽️', '🥣',
  
  // === PARTY & CELEBRATION ===
  '🎂', '🧁', '🍰', '🎈', '🎀', '🎁', '🎊', '🎉',
  '🎯', '🎪', '🎨', '🎭', '🎠', '🎡', '🎢', '🎳',
  '🎲', '🃏', '🀄', '🎴', '🧩', '🎮', '🕹️', '🎯',
  
  // === MAGISCHE ELEMENTE ===
  '🔮', '✨', '💫', '🌟', '⭐', '🌠', '💎', '💍',
  '👑', '🎖️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎗️',
  '🦄', '🐉', '🧚', '🧞', '🧙', '🔥', '💥', '💢',
  
  // === REGENBOGEN & FARBEN ===
  '🌈', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫',
  '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻',
  '💠', '◆', '◇', '◈', '◉', '◎', '●', '○'
];

export default function FlavorSettings() {
  const [customFlavors, setCustomFlavors] = useState<CustomFlavor[]>([]);
  const [hiddenFlavors, setHiddenFlavors] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorIcon, setNewFlavorIcon] = useState(emojiOptions[0]);
  const [newFlavorColor, setNewFlavorColor] = useState(colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');

  const {
    getCustomFlavors,
    saveCustomFlavor,
    deleteCustomFlavor,
    getHiddenFlavors,
    saveHiddenFlavors,
  } = useSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [flavors, hidden] = await Promise.all([
        getCustomFlavors(),
        getHiddenFlavors(),
      ]);
      setCustomFlavors(flavors);
      setHiddenFlavors(hidden);
    } catch (error) {
      console.error('Error loading flavor settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName.trim()) return;

    try {
      const newFlavor: CustomFlavor = {
        name: newFlavorName.trim(),
        icon: newFlavorIcon,
        color: newFlavorColor,
      };

      const savedFlavor = await saveCustomFlavor(newFlavor);
      setCustomFlavors(prev => [...prev, savedFlavor]);
      setNewFlavorName('');
      setNewFlavorIcon(emojiOptions[0]);
      setNewFlavorColor(colorOptions[0]);
      setShowAddForm(false);
      setEmojiSearch('');
      showNotification('success', 'Geschmacksrichtung erfolgreich hinzugefügt');
    } catch (error) {
      console.error('Error adding flavor:', error);
      showNotification('error', 'Fehler beim Hinzufügen der Geschmacksrichtung');
    }
  };

  const handleDeleteFlavor = async (flavorId: string) => {
    try {
      await deleteCustomFlavor(flavorId);
      setCustomFlavors(prev => prev.filter(f => f.id !== flavorId));
      setDeleteConfirm(null);
      showNotification('success', 'Geschmacksrichtung erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting flavor:', error);
      showNotification('error', 'Fehler beim Löschen der Geschmacksrichtung');
    }
  };

  const toggleFlavorVisibility = async (flavorId: string) => {
    const newHiddenFlavors = hiddenFlavors.includes(flavorId)
      ? hiddenFlavors.filter(id => id !== flavorId)
      : [...hiddenFlavors, flavorId];

    try {
      await saveHiddenFlavors(newHiddenFlavors);
      setHiddenFlavors(newHiddenFlavors);
    } catch (error) {
      console.error('Error updating flavor visibility:', error);
      showNotification('error', 'Fehler beim Aktualisieren der Sichtbarkeit');
    }
  };

  // Filter emojis based on search
  const filteredEmojis = emojiSearch 
    ? emojiOptions.filter(emoji => {
        // Simple search - you could enhance this with emoji names/descriptions
        return emoji.includes(emojiSearch);
      })
    : emojiOptions;

  const allFlavors: IceFlavor[] = customFlavors.map(cf => ({
    id: cf.id!,
    name: cf.name,
    icon: cf.icon,
    color: cf.color,
    isCustom: true,
  }));

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-600">Lade Geschmacksrichtungen...</p>
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
              <h2 className="text-xl font-bold text-stone-800 mb-2">Geschmacksrichtung löschen?</h2>
              <p className="text-stone-600 mb-6">
                Sind Sie sicher, dass Sie diese Geschmacksrichtung löschen möchten?
                Alle zugehörigen Daten bleiben erhalten.
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Geschmacksrichtungen verwalten</h2>
            <p className="text-stone-600 mt-1">
              Fügen Sie neue Geschmacksrichtungen hinzu oder blenden Sie bestehende aus
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Neue Sorte</span>
          </button>
        </div>
      </div>

      {/* Add Flavor Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Neue Geschmacksrichtung hinzufügen</h3>
          <form onSubmit={handleAddFlavor} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Name Input */}
              <div>
                <label htmlFor="flavorName" className="block text-sm font-medium text-stone-700 mb-2">
                  Name
                </label>
                <input
                  id="flavorName"
                  type="text"
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="z.B. Stracciatella"
                  required
                />
              </div>

              {/* Symbol Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Symbol auswählen
                </label>
                
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Emoji suchen..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
                
                {/* Emoji Grid */}
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto border border-stone-300 rounded-lg p-3 bg-stone-50">
                  {filteredEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewFlavorIcon(emoji)}
                      className={`w-8 h-8 text-lg border rounded flex items-center justify-center transition-all hover:scale-110 ${
                        newFlavorIcon === emoji
                          ? 'border-amber-500 bg-amber-100 shadow-md scale-110'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-white'
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                
                {filteredEmojis.length === 0 && emojiSearch && (
                  <p className="text-sm text-stone-500 mt-2 text-center">
                    Keine Emojis gefunden. Versuchen Sie eine andere Suche.
                  </p>
                )}
                
                <p className="text-xs text-stone-500 mt-2">
                  {filteredEmojis.length} von {emojiOptions.length} Symbolen verfügbar
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Farbe auswählen ({colorOptions.length} Farben verfügbar)
                </label>
                <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto border border-stone-300 rounded-lg p-3 bg-stone-50">
                  {colorOptions.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      onClick={() => setNewFlavorColor(color)}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} border-2 transition-all hover:scale-110 ${
                        newFlavorColor === color
                          ? 'border-stone-800 shadow-lg scale-110'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Scrollen Sie für mehr Farben • {colorOptions.length} Farbkombinationen
                </p>
              </div>
            </div>

            {/* Preview and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-stone-600 font-medium">Vorschau:</span>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${newFlavorColor} flex items-center justify-center text-2xl shadow-lg border-2 border-white`}>
                  {newFlavorIcon}
                </div>
                <div>
                  <div className="font-bold text-stone-800 text-lg">{newFlavorName || 'Name eingeben'}</div>
                  <div className="text-sm text-stone-500">Neue Eissorte</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEmojiSearch('');
                  }}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!newFlavorName.trim()}
                  className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>Hinzufügen</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Flavors List */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-100">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Alle Geschmacksrichtungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allFlavors.map((flavor) => {
            const isHidden = hiddenFlavors.includes(flavor.id);
            return (
              <div
                key={flavor.id}
                className={`border rounded-lg p-4 transition-all ${
                  isHidden ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${flavor.color} flex items-center justify-center text-lg`}>
                    {flavor.icon}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleFlavorVisibility(flavor.id)}
                      className={`p-1.5 rounded transition-colors ${
                        isHidden
                          ? 'text-stone-400 hover:text-stone-600'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                      title={isHidden ? 'Einblenden' : 'Ausblenden'}
                    >
                      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {flavor.isCustom && (
                      <button
                        onClick={() => setDeleteConfirm(flavor.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-medium text-stone-800">{flavor.name}</h4>
                <p className="text-xs text-stone-500 mt-1">
                  {flavor.isCustom ? 'Benutzerdefiniert' : 'Standard'}
                  {isHidden && ' • Ausgeblendet'}
                </p>
              </div>
            );
          })}
        </div>

        {allFlavors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-stone-600">Keine Geschmacksrichtungen verfügbar.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">🍦</span>
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">Hinweise zu Geschmacksrichtungen</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Über {emojiOptions.length} Emojis speziell für Eis, Desserts, Früchte, Süßigkeiten und Nüsse verfügbar</li>
              <li>• <strong>{colorOptions.length} verschiedene Farbkombinationen</strong> - von Pastell bis intensiv</li>
              <li>• Nutzen Sie die Suchfunktion, um schnell das passende Symbol zu finden</li>
              <li>• Alle Geschmacksrichtungen können ein- und ausgeblendet werden</li>
              <li>• Beim Löschen einer Sorte bleiben alle zugehörigen Daten erhalten</li>
              <li>• Wählen Sie aussagekräftige Namen und passende Symbole für Ihre Sorten</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}