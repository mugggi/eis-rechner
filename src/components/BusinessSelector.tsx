import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Pencil, Trash2, Building2, Check, X } from 'lucide-react';
import { Business } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import BusinessForm from './BusinessForm';

interface BusinessSelectorProps {
  onBusinessSelect: (business: Business) => void;
  onLogout: () => void;
  userName: string;
}

export default function BusinessSelector({ 
  onBusinessSelect, 
  onLogout, 
  userName 
}: BusinessSelectorProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { getBusinesses, createBusiness, updateBusiness, deleteBusiness, loading } = useSupabase();

  useEffect(() => {
    loadBusinesses();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadBusinesses = async () => {
    try {
      const businessData = await getBusinesses();
      setBusinesses(businessData);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleCreateBusiness = async (businessData: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBusiness = await createBusiness(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      setShowForm(false);
      showNotification('success', 'Geschäft erfolgreich erstellt');
    } catch (error) {
      console.error('Error creating business:', error);
      showNotification('error', 'Fehler beim Erstellen des Geschäfts');
    }
  };

  const handleUpdateBusiness = async (businessData: Business) => {
    try {
      const updatedBusiness = await updateBusiness(businessData);
      setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
      setEditingBusiness(null);
      setShowForm(false);
      showNotification('success', 'Geschäft erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating business:', error);
      showNotification('error', 'Fehler beim Aktualisieren des Geschäfts');
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await deleteBusiness(businessId);
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      setDeleteConfirm(null);
      showNotification('success', 'Geschäft erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting business:', error);
      showNotification('error', 'Fehler beim Löschen des Geschäfts');
    }
  };

  if (showForm) {
    return (
      <BusinessForm
        business={editingBusiness}
        onSave={editingBusiness ? handleUpdateBusiness : handleCreateBusiness}
        onCancel={() => {
          setShowForm(false);
          setEditingBusiness(null);
        }}
        loading={loading}
      />
    );
  }

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
              <h2 className="text-xl font-bold text-stone-800 mb-2">Geschäft löschen?</h2>
              <p className="text-stone-600 mb-6">
                Sind Sie sicher, dass Sie dieses Geschäft löschen möchten? 
                Alle zugehörigen Daten werden ebenfalls gelöscht.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteBusiness(deleteConfirm)}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Willkommen, {userName}!</h1>
            <p className="text-stone-600">Wählen Sie ein Geschäft aus oder erstellen Sie ein neues</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-white/50 rounded-lg transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Abmelden</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="ice-card group cursor-pointer relative"
              onClick={() => onBusinessSelect(business)}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBusiness(business);
                    setShowForm(true);
                  }}
                  className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(business.id);
                  }}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${business.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                {business.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-800 text-center mb-2">{business.name}</h3>
              <p className="text-stone-600 text-center text-sm">{business.description}</p>
            </div>
          ))}

          <div
            onClick={() => setShowForm(true)}
            className="ice-card cursor-pointer border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50 flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-600">Neues Geschäft erstellen</h3>
            <p className="text-stone-400 text-sm mt-1">Klicken Sie hier zum Hinzufügen</p>
          </div>
        </div>

        {businesses.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-stone-600 mb-2">Keine Geschäfte vorhanden</h3>
            <p className="text-stone-400 mb-6">Erstellen Sie Ihr erstes Geschäft, um zu beginnen</p>
          </div>
        )}
      </div>
    </div>
  );
}