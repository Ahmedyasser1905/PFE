import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Récupère tes clés depuis le dashboard Supabase (Paramètres -> API)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'VOTRE_URL_SUPABASE';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'VOTRE_CLÉ_ANON_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Gérer intelligemment l'actualisation du token quand l'app revient en premier plan
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
