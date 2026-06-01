import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE } from './config';

/**
 * Cliente Supabase, criado apenas quando as variáveis de ambiente existem
 * (EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY). Quando ausente,
 * o app opera no modo mock e este cliente fica `null`.
 *
 * A sessão é persistida via AsyncStorage (localStorage na web), mantendo o
 * admin logado entre aberturas.
 */
export const supabase: SupabaseClient | null = SUPABASE.ativo
  ? createClient(SUPABASE.url, SUPABASE.anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Garante um cliente não-nulo; usar apenas quando SUPABASE.ativo. */
export function clienteSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase não configurado.');
  return supabase;
}
