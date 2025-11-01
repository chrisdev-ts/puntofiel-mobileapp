// Barrel exports para la capa de infraestructura

export { env } from "./config/env";
export { queryClient } from "./config/queryClient";
export { SupabaseLoyaltyRepository } from "./repositories/SupabaseLoyaltyRepository";
export { SupabaseUserRepository } from "./repositories/SupabaseUserRepository";
export { supabase, supabaseConfig } from "./services/supabase";
