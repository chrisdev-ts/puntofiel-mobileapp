import { z } from "zod";
import type { BusinessCategory } from "@/src/core/entities/Business";

/**
 * Schema de validación para el formulario de creación/edición de negocios
 * Define las reglas de validación con Zod
 */
export const businessFormSchema = z.object({
	name: z
		.string()
		.min(3, "El nombre debe tener al menos 3 caracteres")
		.max(100, "El nombre no puede exceder 100 caracteres"),
	category: z.enum(
		[
			"food",
			"cafe",
			"restaurant",
			"retail",
			"services",
			"entertainment",
			"health",
			"other",
		],
		{
			errorMap: () => ({ message: "Selecciona una categoría válida" }),
		},
	),
	locationAddress: z.string().optional(),
	directions: z.string().optional(),
	openingHours: z.string().optional(),
});

/**
 * Tipo TypeScript inferido desde el schema Zod
 * Asegura consistencia entre validación y tipos
 */
export type BusinessFormData = z.infer<typeof businessFormSchema>;

/**
 * Labels amigables para las categorías de negocio
 * Usado en el selector de categorías del formulario
 */
export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
	food: "Comida",
	cafe: "Cafetería",
	restaurant: "Restaurante",
	retail: "Retail/Ropa",
	services: "Servicios",
	entertainment: "Entretenimiento",
	health: "Salud y Bienestar",
	other: "Otro",
};
