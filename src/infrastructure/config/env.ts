// Configuración de variables de entorno para Expo
// Este archivo centraliza el acceso a las variables de entorno

interface EnvConfig {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	APP_NAME: string;
	APP_VERSION: string;
	ENV: string;
}

const getEnvVars = (): EnvConfig => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
	const appName = process.env.EXPO_PUBLIC_APP_NAME || "PuntoFiel Mobile App";
	const appVersion = process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0";
	const env = process.env.EXPO_PUBLIC_ENV || "development";

	// Validación de variables requeridas
	if (!supabaseUrl) {
		throw new Error("EXPO_PUBLIC_SUPABASE_URL is required");
	}

	if (!supabaseAnonKey) {
		throw new Error("EXPO_PUBLIC_SUPABASE_ANON_KEY is required");
	}

	return {
		SUPABASE_URL: supabaseUrl,
		SUPABASE_ANON_KEY: supabaseAnonKey,
		APP_NAME: appName,
		APP_VERSION: appVersion,
		ENV: env,
	};
};

export const env = getEnvVars();
