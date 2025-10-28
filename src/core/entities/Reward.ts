/**
 * Entidad de dominio: Recompensa
 * 
 * Representa una recompensa que un negocio ofrece a sus clientes
 * a cambio de puntos de fidelidad.
 */
export interface Reward {
  //Identificador único de la recompensa
  id: string;

  //ID del negocio al que pertenece
  businessId: string;

  //Nombre de la recompensa (ej. "Café Gratis")
  name: string;

  //Descripción detallada de la recompensa
  description?: string;

  //Cantidad de puntos necesarios para canjear 
  pointsRequired: number;

  //URL de la imagen de la recompensa 
  imageUrl?: string;

  //Indica si la recompensa está activa 
  isActive: boolean;

  //Fecha de creación
  createdAt: Date;

  //Fecha de última actualización
  updatedAt: Date;
}

/**
 * DTO para crear una nueva recompensa
 * 
 * Contiene solo los datos necesarios para la creación.
 * Los campos como 'id', 'createdAt' y 'updatedAt' se generan automáticamente.
 */
export interface CreateRewardDTO {
  //ID del negocio al que pertenece
  businessId: string;

  //Nombre de la recompensa
  name: string;

  //Descripción detallada (opcional)
  description?: string;

  //Cantidad de puntos necesarios
  pointsRequired: number;
}

/**
 * DTO para actualizar una recompensa existente
 */
export interface UpdateRewardDTO {
  //Nuevo nombre de la recompensa
  name?: string;

  //Nueva descripción
  description?: string;

  //Nuevos puntos requeridos
  pointsRequired?: number;
}