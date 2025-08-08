import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, BarChart3, Settings } from 'lucide-react';
import { Business } from '../types';
import SalesTracker from './SalesTracker';
import SalesHistory from './SalesHistory';
import FlavorSettings from './FlavorSettings';

interface DashboardProps {
  onLogout: () => void;
  selectedBusiness: Business;
  onBackToBusiness: () => void;
}

type DashboardView = 'tracker' | 'history' | 'settings';

export default function Dashboard({ onLogout, selectedBusiness, onBackToBusiness }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('tracker');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const navigationItems = [
    { id: 'tracker', label: 'Verkaufstracker', icon: Calendar },
    { id: 'history', label: 'Verkaufsverlauf', icon: BarChart3 },
    { id: 'settings', label: 'Sorten verwalten', icon: Settings },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tracker':
        return (
          <SalesTracker
            selectedBusiness={selectedBusiness}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        );
      case 'history':
        return <SalesHistory selectedBusiness={selectedBusiness} />;
      case 'settings':
        return <FlavorSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-100 via-stone-50 to-white text-stone-800 shadow-xl border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToBusiness}
                className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Geschäfte</span>
              </button>
              <div className="h-6 w-px bg-stone-300" />
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedBusiness.color} flex items-center justify-center text-lg`}>
                  {selectedBusiness.icon}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-stone-800">{selectedBusiness.name}</h1>
                  <p className="text-sm text-stone-500">{selectedBusiness.description}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
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
                  onClick={() => setCurrentView(item.id as DashboardView)}
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