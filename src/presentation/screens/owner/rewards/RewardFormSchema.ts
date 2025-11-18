import { z } from "zod";

export const createRewardSchema = z.object({
	name: z
		.string({ required_error: "El nombre de la recompensa es requerido" })
		.trim()
		.min(1, "El nombre es requerido")
		.refine((val) => val.replace(/\s/g, "").length >= 3, {
			message:
				"El nombre debe tener al menos 3 caracteres (sin contar espacios)",
		})
		.refine((val) => val.replace(/\s/g, "").length <= 50, {
			message: "El nombre no puede exceder 50 caracteres (sin contar espacios)",
		}),

	description: z
		.string()
		.trim()
		.optional()
		.refine(
			(val) => {
				if (!val) return true;
				return val.replace(/\s/g, "").length >= 10;
			},
			{
				message:
					"La descripción debe tener al menos 10 caracteres (sin contar espacios)",
			},
		)
		.refine(
			(val) => {
				if (!val) return true;
				return val.replace(/\s/g, "").length <= 200;
			},
			{
				message:
					"La descripción no puede exceder 200 caracteres (sin contar espacios)",
			},
		),

	points_required: z.coerce
		.number({ required_error: "Los puntos son requeridos" })
		.positive("Los puntos deben ser mayores a 0")
		.int("Los puntos deben ser un número entero")
		.min(1, "Debe requerir al menos 1 punto"),
});

export type CreateRewardFormValues = z.infer<typeof createRewardSchema>;

// Schema para actualizar recompensas
export const updateRewardSchema = z.object({
	name: z
		.string()
		.trim()
		.refine((val) => !val || val.replace(/\s/g, "").length >= 3, {
			message:
				"El nombre debe tener al menos 3 caracteres (sin contar espacios)",
		})
		.refine((val) => !val || val.replace(/\s/g, "").length <= 50, {
			message: "El nombre no puede exceder 50 caracteres (sin contar espacios)",
		})
		.optional(),

	description: z
		.string()
		.trim()
		.refine(
			(val) => {
				if (!val) return true;
				return val.replace(/\s/g, "").length >= 10;
			},
			{
				message:
					"La descripción debe tener al menos 10 caracteres (sin contar espacios)",
			},
		)
		.refine(
			(val) => {
				if (!val) return true;
				return val.replace(/\s/g, "").length <= 200;
			},
			{
				message:
					"La descripción no puede exceder 200 caracteres (sin contar espacios)",
			},
		)
		.optional(),

	points_required: z.coerce
		.number()
		.positive("Los puntos deben ser mayores a 0")
		.int("Los puntos deben ser un número entero")
		.min(1, "Debe requerir al menos 1 punto")
		.optional(),
});

export type UpdateRewardFormValues = z.infer<typeof updateRewardSchema>;
