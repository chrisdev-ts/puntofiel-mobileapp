import { z } from "zod";

/**
 * Schema base de validación para empleados
 */
const EmployeeBaseSchema = z.object({
	firstName: z
		.string()
		.min(2, "El nombre debe tener al menos 2 caracteres")
		.max(50, "El nombre no puede exceder 50 caracteres"),
	lastName: z
		.string()
		.min(2, "El apellido paterno debe tener al menos 2 caracteres")
		.max(50, "El apellido paterno no puede exceder 50 caracteres"),
	secondLastName: z
		.string()
		.max(50, "El apellido materno no puede exceder 50 caracteres")
		.optional(),
	email: z.string().email("Correo electrónico inválido").toLowerCase().trim(),
});

/**
 * Schema para crear empleado (contraseña requerida)
 */
export const CreateEmployeeSchema = EmployeeBaseSchema.extend({
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Las contraseñas no coinciden",
	path: ["confirmPassword"],
});

/**
 * Schema para editar empleado (contraseña opcional)
 */
export const EditEmployeeSchema = EmployeeBaseSchema.extend({
	password: z
		.string()
		.min(8, "La contraseña debe tener al menos 8 caracteres")
		.optional()
		.or(z.literal("")),
	confirmPassword: z.string().optional().or(z.literal("")),
}).refine(
	(data) => {
		// Solo validar confirmación si se proporcionó una contraseña
		if (data.password && data.password.length > 0) {
			return data.password === data.confirmPassword;
		}
		return true;
	},
	{
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	},
);

// Schema general
export const EmployeeSchema = CreateEmployeeSchema;

// EXPORTAR TODOS LOS TIPOS
export type CreateEmployeeFormData = z.infer<typeof CreateEmployeeSchema>;
export type EditEmployeeFormData = z.infer<typeof EditEmployeeSchema>;
export type EmployeeFormData = CreateEmployeeFormData; // Tipo por defecto para compatibilidad
