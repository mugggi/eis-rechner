import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Pencil, Trash2, User } from 'lucide-react';
import { CustomerProfile } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import ProfileForm from './ProfileForm';

interface CustomerProfileSelectorProps {
  onProfileSelect: (profile: CustomerProfile) => void;
  onLogout: () => void;
  userName: string;
}

export default function CustomerProfileSelector({ 
  onProfileSelect, 
  onLogout, 
  userName 
}: CustomerProfileSelectorProps) {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CustomerProfile | null>(null);
  const { getCustomerProfiles, createCustomerProfile, updateCustomerProfile, deleteCustomerProfile, loading } = useSupabase();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const profileData = await getCustomerProfiles();
      setProfiles(profileData);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleCreateProfile = async (profileData: Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProfile = await createCustomerProfile(profileData);
      setProfiles(prev => [...prev, newProfile]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async (profileData: CustomerProfile) => {
    try {
      const updatedProfile = await updateCustomerProfile(profileData);
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      setEditingProfile(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Profil löschen möchten?')) {
      try {
        await deleteCustomerProfile(profileId);
        setProfiles(prev => prev.filter(p => p.id !== profileId));
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (showForm) {
    return (
      <ProfileForm
        profile={editingProfile}
        onSave={editingProfile ? handleUpdateProfile : handleCreateProfile}
        onCancel={() => {
          setShowForm(false);
          setEditingProfile(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Willkommen, {userName}!</h1>
            <p className="text-gray-600">Wählen Sie ein Kundenprofil aus oder erstellen Sie ein neues</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Abmelden</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="ice-cream-card group cursor-pointer relative"
              onClick={() => onProfileSelect(profile)}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProfile(profile);
                    setShowForm(true);
                  }}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProfile(profile.id);
                  }}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                {profile.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{profile.name}</h3>
              <p className="text-gray-600 text-center text-sm">{profile.description}</p>
            </div>
          ))}

          <div
            onClick={() => setShowForm(true)}
            className="ice-cream-card cursor-pointer border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">Neues Profil erstellen</h3>
            <p className="text-gray-400 text-sm mt-1">Klicken Sie hier zum Hinzufügen</p>
          </div>
        </div>

        {profiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Keine Profile vorhanden</h3>
            <p className="text-gray-400 mb-6">Erstellen Sie Ihr erstes Kundenprofil, um zu beginnen</p>
          </div>
        )}
      </div>
    </div>
  );
}