import { z } from "zod";

/**
 * Schema de validación para el formulario de registro de usuario.
 * Adaptado a la estructura de la tabla 'profiles' de la base de datos.
 */
export const registerSchema = z
	.object({
		// Primer nombre (obligatorio)
		firstName: z
			.string()
			.min(1, "El primer nombre es requerido")
			.min(2, "El nombre debe tener al menos 2 caracteres")
			.max(50, "El nombre no puede exceder 50 caracteres")
			.regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
			.trim(),

		// Apellido paterno (opcional)
		lastName: z
			.string()
			.min(1, "El apellido paterno es requerido")
			.min(2, "El apellido debe tener al menos 2 caracteres")
			.max(50, "El apellido no puede exceder 50 caracteres")
			.regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
			.trim(),

		// Apellido materno (opcional)
		secondLastName: z
			.string()
			.max(50, "El apellido no puede exceder 50 caracteres")
			.regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
			.trim()
			.optional()
			.or(z.literal("")),

		// Correo electrónico con validación
		email: z
			.string()
			.min(1, "El correo electrónico es requerido")
			.email("Ingresa un correo electrónico válido")
			.toLowerCase()
			.trim(),

		// Teléfono (opcional)
		phone: z
			.string()
			.regex(/^\d{3}-\d{3}-\d{4}$/, "Formato inválido. Ej: 555-123-4567")
			.transform((val) => val.replace(/-/g, "")) // Remover guiones para BD
			.optional()
			.or(z.literal("")), // Contraseña
		password: z
			.string()
			.min(1, "La contraseña es requerida")
			.min(8, "La contraseña debe tener al menos 8 caracteres")
			.regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
			.regex(/[a-z]/, "Debe contener al menos una letra minúscula")
			.regex(/[0-9]/, "Debe contener al menos un número")
			.regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"), // Confirmar contraseña
		confirmPassword: z.string().min(1, "Confirme su contraseña"),

		// Switch para tipo de usuario
		isBusinessOwner: z.boolean(),

		// Checkbox obligatorio para términos y condiciones
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: "Debe aceptar los términos y condiciones para continuar",
		}),
	})

	// Validación cruzada: las contraseñas deben coincidir
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

/**
 * Tipo TypeScript inferido automáticamente del schema.
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Utilidad para formatear número de teléfono automáticamente.
 * Convierte entrada numérica a formato 555-123-4567.
 */
export const formatPhoneNumber = (value: string): string => {
	// Remover todo lo que no sea dígito
	const numbers = value.replace(/\D/g, "");

	// Limitar a 10 dígitos
	const limitedNumbers = numbers.slice(0, 10);

	// Aplicar formato según la cantidad de dígitos
	if (limitedNumbers.length === 0) return "";
	if (limitedNumbers.length <= 3) return limitedNumbers;
	if (limitedNumbers.length <= 6) {
		return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
	}

	// Formato completo 555-123-4567
	return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
};

/**
 * Utilidad para extraer solo los números del teléfono formateado.
 * Convierte 555-123-4567 a 5551234567 para almacenar en BD.
 */
export const cleanPhoneNumber = (formattedPhone: string): string => {
	return formattedPhone.replace(/\D/g, "");
};
