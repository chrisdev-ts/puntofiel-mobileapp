// Hook para obtener el ID del negocio del usuario autenticado usando TanStack Query
import { supabase } from "@/src/infrastructure/services/supabase";
import { useQuery } from "@tanstack/react-query";

// CONFIGURACIÓN TEMPORAL PARA DESARROLLO
// eliminar etsta linea despues
const MOCK_USER_ID = '7a970bbd-11dd-4b16-a402-d48bb6f44101'; // debe reemplazarse con el user_id real

async function fetchBusinessId(): Promise<string> {

    // MODO DESARROLLO: Usar usuario mock
    // Cuando la autenticación esté lista, descomenta esto:
    // const {
    // 	data: { user },
    // 	error: authError,
    // } = await supabase.auth.getUser();
    // 
    // if (authError || !user) {
    // 	throw new Error("No hay usuario autenticado");
    // }
    // const userId = user.id;

    // TEMPORAL -- Simular usuario autenticado
    const userId = MOCK_USER_ID;

    const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId)
        .single();

    if (error) {
        console.error('Error obteniendo negocio:', error);
        throw new Error(`No se encontró el negocio del usuario: ${error.message}`);
    }

    if (!data) {
        console.error('No hay datos de negocio');
        throw new Error("No se encontró el negocio del usuario");
    }

    //console.log('Negocio encontrado:', data.id);
    return data.id;
}

export function useBusinessId() {
    return useQuery({
        queryKey: ["businessId"],
        queryFn: fetchBusinessId,
        staleTime: 1000 * 60 * 10, // 10 minutos
        retry: 1,

    });
}
