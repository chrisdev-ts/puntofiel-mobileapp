import { z } from "zod";

export const createRaffleSchema = z.object({
    name: z
        .string({ required_error: "El nombre es requerido" })
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),

    prize: z
        .string({ required_error: "El premio principal es requerido" })
        .min(3, "El premio debe tener al menos 3 caracteres"),

    description: z
        .string({ required_error: "La descripción es requerida" })
        .min(10, "La descripción debe tener al menos 10 caracteres"),

    points_required: z.coerce
        .number({ required_error: "Los puntos son requeridos" })
        .positive("Debe ser mayor a 0")
        .int(),

    max_tickets_per_user: z.coerce
        .number({ required_error: "El límite de boletos es requerido" })
        .positive("Debe ser mayor a 0")
        .int(),

    start_date: z.date({ required_error: "La fecha de inicio es requerida" }),
    
    end_date: z.date({ required_error: "La fecha de finalización es requerida" }),
})
.refine((data) => data.end_date > data.start_date, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["end_date"],
});

export type CreateRaffleFormValues = z.infer<typeof createRaffleSchema>;