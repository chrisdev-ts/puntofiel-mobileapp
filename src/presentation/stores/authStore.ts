/**
 * Store de Zustand para el estado de autenticación global
 *
 * Responsabilidades:
 * - Mantener el estado de la sesión del usuario autenticado
 * - Sincronizar con Supabase Auth
 * - Proporcionar el usuario actual a toda la aplicación
 */

import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import type { User } from "@/src/core/entities/User";

interface AuthState {
	// Estado
	user: User | null;
	session: Session | null;
	isLoading: boolean;

	// Acciones
	setUser: (user: User | null) => void;
	setSession: (session: Session | null) => void;
	setLoading: (isLoading: boolean) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	// Estado inicial
	user: null,
	session: null,
	isLoading: true, // true inicialmente mientras verificamos la sesión

	// Acciones
	setUser: (user) => set({ user }),
	setSession: (session) => set({ session }),
	setLoading: (isLoading) => set({ isLoading }),
	clearAuth: () => set({ user: null, session: null, isLoading: false }),
}));
