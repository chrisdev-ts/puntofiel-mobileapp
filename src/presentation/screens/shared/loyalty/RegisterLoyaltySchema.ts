// Esquema de validación para el formulario de registro de puntos de lealtad
import { z } from "zod";

export const registerLoyaltySchema = z.object({
	amount: z
		.string({ message: "El monto es requerido" })
		.min(1, "El monto es requerido")
		.refine((val) => !Number.isNaN(Number(val)), {
			message: "Debe ser un número válido",
		})
		.refine((val) => Number(val) > 0, {
			message: "El monto debe ser mayor a 0",
		}),
	notes: z.string().optional(),
});

export type RegisterLoyaltyFormValues = z.infer<typeof registerLoyaltySchema>;
