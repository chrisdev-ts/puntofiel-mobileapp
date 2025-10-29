// Define la estructura de un objeto User en nuestro dominio.
// Mapea directamente a la tabla 'profiles' de Supabase
export interface User {
	id: string;
	first_name: string;
	last_name?: string;
	second_last_name?: string;
	email: string;
	role: "customer" | "employee" | "owner";
	created_at?: string;
	updated_at?: string;
}
