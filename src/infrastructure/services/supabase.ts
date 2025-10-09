// Cliente de Supabase configurado para React Native
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// Crear cliente de Supabase con las variables de entorno
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
	auth: {
		// Configuración específica para React Native
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

// Exportar también las configuraciones para uso directo si es necesario
export const supabaseConfig = {
	url: env.SUPABASE_URL,
	anonKey: env.SUPABASE_ANON_KEY,
};
