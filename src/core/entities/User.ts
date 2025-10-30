// Define la estructura de un objeto User en nuestro dominio.
export interface User {
	id: string;
	firstName: string;
	lastName: string;
	secondLastName?: string;
	role: "customer" | "business_owner" | "admin";
	phone?: string;
	updatedAt: Date;
}
/**
 * DTO para crear un nuevo usuario.
 * Incluye el password que se enviará a Supabase Auth.
 */
export interface CreateUserDTO {
	firstName: string;
	lastName: string;
	secondLastName?: string;
	email: string;
	phone: string;
	password: string;
	role: "customer" | "business_owner";
}
/**
 * DTO para el inicio de sesión.
 */
export interface LoginUserDTO {
	email: string;
	password: string;
}
