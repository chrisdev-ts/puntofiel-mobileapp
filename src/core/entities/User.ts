// Define la estructura de un objeto User en nuestro dominio.
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	secondLastName?: string;
	role: "customer" | "employee" | "owner";
	phone?: string;
	createdAt: Date;
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
	phone?: string;
	password: string;
	role: "customer" | "owner";
}
/**
 * DTO para el inicio de sesión.
 */
export interface LoginUserDTO {
	email: string;
	password: string;
}
