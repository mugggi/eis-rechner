# 🍦 Eis-Rechner

Eine professionelle Anwendung zur Gewichtsverfolgung von Eisverkäufen mit automatischer Netto-Berechnung und umfassendem Datenmanagement.

![Eis-Rechner Screenshot](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Eis-Rechner+🍦)

## ✨ Features

### 🧮 **Gewichtsberechnung**
- Einfache Eingabe von Brutto-Gewichten
- Automatische Netto-Berechnung (Brutto - 700g Behälter)
- Intuitive Taschenrechner-Oberfläche

### 🍨 **Eissorte-Verwaltung**
- Über 400 Emojis für Eissorten verfügbar
- 100+ Farbkombinationen für visuelle Unterscheidung
- Unbegrenzt eigene Eissorten erstellen
- Sorten ein-/ausblenden nach Bedarf

### 🏪 **Geschäfte-Verwaltung**
- Mehrere Verkaufsstandorte verwalten
- Individuelle Geschäftsprofile mit Icons und Farben
- Getrennte Datenerfassung pro Standort

### 📊 **Datenmanagement**
- Verkaufsdaten bearbeiten und löschen
- Monatliche Massenlöschung mit Passwort-Schutz
- Filterung nach Datum und Eissorte
- Automatische Datensicherung in der Cloud

### 📈 **Export & Analyse**
- Excel-Export mit Zusammenfassung und Detaildaten
- Verkaufsverlauf mit Statistiken
- Tägliche, monatliche und jährliche Auswertungen
- Automatische Berechnung von Durchschnittswerten

### 📱 **Benutzerfreundlichkeit**
- Vollständig responsive Design (Mobile, Tablet, Desktop)
- Offline-fähig nach erstem Laden
- Schnelle Performance durch moderne Technologien
- Intuitive Bedienung ohne Einarbeitung

## 🛠️ Technologien

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Export**: XLSX (Excel-Dateien)
- **Deployment**: Netlify / GitHub Pages

## 🚀 Installation

### Voraussetzungen
- Node.js 18+ installiert
- Supabase Account (kostenlos)

### 1. Repository klonen
```bash
git clone https://github.com/IHR-USERNAME/eis-rechner.git
cd eis-rechner
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
# .env Datei erstellen
cp .env.example .env

# .env Datei bearbeiten und Supabase-Credentials eintragen:
VITE_SUPABASE_URL=https://ihr-projekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=ihr-anon-key
```

### 4. Supabase Datenbank einrichten
1. Neues Projekt auf [supabase.com](https://supabase.com) erstellen
2. SQL-Migrationen aus `supabase/migrations/` ausführen
3. Row Level Security (RLS) ist automatisch aktiviert

### 5. Development Server starten
```bash
npm run dev
```

Die Anwendung ist dann verfügbar unter: `http://localhost:5173`

## 📦 Deployment

### GitHub Pages (Automatisch)
1. Repository auf GitHub pushen
2. In Repository Settings → Pages → Source: "GitHub Actions" auswählen
3. Secrets hinzufügen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Bei jedem Push wird automatisch deployed

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/IHR-USERNAME/eis-rechner)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/IHR-USERNAME/eis-rechner)

## 🗄️ Datenbankschema

### Tabellen
- **customer_profiles** - Geschäfte/Verkaufsstandorte
- **custom_flavors** - Benutzerdefinierte Eissorten
- **weight_entries** - Gewichtseinträge mit automatischer Netto-Berechnung
- **daily_sales** - Tägliche Verkaufszahlen (für zukünftige Features)

### Sicherheit
- Row Level Security (RLS) aktiviert
- Benutzer können nur ihre eigenen Daten sehen
- Sichere Authentifizierung über Supabase Auth

## 🎯 Verwendung

### 1. **Anmelden**
- E-Mail und Passwort eingeben
- Registrierung ist deaktiviert (Admin-only)

### 2. **Geschäft auswählen/erstellen**
- Neues Geschäft mit Icon und Farbe erstellen
- Oder vorhandenes Geschäft auswählen

### 3. **Eissorten verwalten**
- Neue Sorten mit über 400 Emojis erstellen
- Aus 100+ Farbkombinationen wählen
- Sorten nach Bedarf ein-/ausblenden

### 4. **Gewichte eingeben**
- Eissorte auswählen
- Brutto-Gewicht eingeben (z.B. 1200g)
- Netto-Gewicht wird automatisch berechnet (1200g - 700g = 500g)
- Mit "Bestätigen" speichern

### 5. **Daten verwalten**
- Einträge bearbeiten oder löschen
- Nach Datum/Sorte filtern
- Monatliche Daten löschen (mit Passwort)

### 6. **Export**
- Excel-Datei mit Zusammenfassung und Details
- Verschiedene Zeiträume wählbar
- Automatische Statistiken

## 🔧 Konfiguration

### Umgebungsvariablen
```env
# Supabase Konfiguration
VITE_SUPABASE_URL=https://ihr-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=ihr-anon-key

# Optional: Custom Konfiguration
VITE_APP_TITLE="Mein Eis-Rechner"
VITE_DEFAULT_CONTAINER_WEIGHT=700
```

### Anpassungen
- **Behältergewicht**: Standard 700g, änderbar in `src/components/Calculator.tsx`
- **Farben**: Neue Farbkombinationen in `src/components/FlavorManager.tsx`
- **Emojis**: Zusätzliche Emojis in der `emojiOptions` Array

## 🤝 Beitragen

1. Fork des Repositories erstellen
2. Feature Branch erstellen (`git checkout -b feature/neue-funktion`)
3. Änderungen committen (`git commit -am 'Neue Funktion hinzugefügt'`)
4. Branch pushen (`git push origin feature/neue-funktion`)
5. Pull Request erstellen

## 📝 Changelog

### Version 1.0.0 (2025-01-XX)
- ✅ Grundfunktionen: Gewichtseingabe und -berechnung
- ✅ Eissorte-Verwaltung mit 400+ Emojis
- ✅ Geschäfte-Verwaltung
- ✅ Excel-Export
- ✅ Responsive Design
- ✅ Supabase Integration

## 🐛 Bekannte Probleme

- **Supabase Inaktivität**: Kostenlose Projekte pausieren nach 7 Tagen Inaktivität
  - **Lösung**: Regelmäßige Nutzung oder Upgrade auf Pro Plan
- **Offline-Modus**: Neue Daten können offline nicht gespeichert werden
  - **Geplant**: Service Worker für Offline-Funktionalität

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/IHR-USERNAME/eis-rechner/issues)
- **Dokumentation**: Siehe README und Code-Kommentare
- **E-Mail**: support@ihr-domain.de

## 📄 Lizenz

MIT License - Siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Danksagungen

- **Supabase** - Backend-as-a-Service
- **Tailwind CSS** - Utility-first CSS Framework
- **Lucide** - Schöne Icons
- **React Team** - Fantastisches Frontend Framework

---

**Entwickelt mit ❤️ für professionelle Eisverkäufer** 🍦

[![Netlify Status](https://api.netlify.com/api/v1/badges/IHRE-BADGE-ID/deploy-status)](https://app.netlify.com/sites/elida-rechner/deploys)