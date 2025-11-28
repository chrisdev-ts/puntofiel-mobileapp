import { z } from "zod";

export const promotionFormSchema = z
	.object({
		title: z
			.string()
			.min(3, "El título debe tener al menos 3 caracteres")
			.max(100, "El título no puede exceder 100 caracteres"),

		content: z
			.string()
			.min(10, "La descripción debe tener al menos 10 caracteres")
			.max(500, "La descripción no puede exceder 500 caracteres"),

		startDate: z.date({
			required_error: "La fecha de inicio es requerida",
			invalid_type_error: "Debe ser una fecha válida",
		}),

		endDate: z
			.date({
				required_error: "La fecha de finalización es requerida",
				invalid_type_error: "Debe ser una fecha válida",
			})
			.optional(),

		imageUrl: z.string().url("URL de imagen inválida").optional(),

		isActive: z.boolean().optional(),
	})
	.refine(
		(data) => {
			if (data.endDate && data.startDate > data.endDate) {
				return false;
			}
			return true;
		},
		{
			message: "La fecha de finalización debe ser posterior a la de inicio",
			path: ["endDate"],
		},
	);

export type PromotionFormData = z.infer<typeof promotionFormSchema>;
