import { z } from "zod";

/**
 * Schema de validación para el formulario de inicio de sesión.
 * Define las reglas que debe cumplir cada campo del formulario.
 */
export const loginSchema = z.object({
	// Correo electrónico
	email: z
		.string()
		.min(1, "El correo electrónico es requerido")
		.email("Ingresa un correo electrónico válido")
		.toLowerCase()
		.trim(),

	// Contraseña
	password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * Tipo TypeScript inferido automáticamente del schema.
 */
export type LoginFormData = z.infer<typeof loginSchema>;
