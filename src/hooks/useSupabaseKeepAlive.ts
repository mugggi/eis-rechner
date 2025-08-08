import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseKeepAlive() {
  useEffect(() => {
    // Ping Supabase alle 6 Stunden um das Projekt aktiv zu halten
    const keepAlive = async () => {
      try {
        // Einfache Abfrage um Verbindung aktiv zu halten
        await supabase.from('customer_profiles').select('count', { count: 'exact', head: true });
        console.log('Supabase keep-alive ping successful');
      } catch (error) {
        console.log('Supabase keep-alive ping failed:', error);
      }
    };

    // Sofort ausführen
    keepAlive();

    // Alle 6 Stunden wiederholen (6 * 60 * 60 * 1000 = 21600000ms)
    const interval = setInterval(keepAlive, 21600000);

    return () => clearInterval(interval);
  }, []);
}