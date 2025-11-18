import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Nombre del bucket único de PuntoFiel
 * Todos los assets (imágenes, archivos) se almacenan aquí
 */
export const BUCKET_NAME = "puntofiel-assets" as const;

/**
 * Rutas estandarizadas para el bucket único de PuntoFiel
 * Estructura: {tipo}/{businessId}/{filename}
 */
export const STORAGE_PATHS = {
	/**
	 * Ruta para imágenes de recompensas
	 * @example rewards/cafe-uuid-123/latte-gratis.jpg
	 */
	rewards: (businessId: string, filename: string) =>
		`rewards/${businessId}/${filename}`,

	/**
	 * Ruta para logos de negocios
	 * @example business-logos/cafe-uuid-123/logo.png
	 */
	businessLogos: (businessId: string, filename: string) =>
		`business-logos/${businessId}/${filename}`,
} as const;

/**
 * Sube un archivo al storage de Supabase
 *
 * @param path - Ruta completa del archivo en el bucket (usar STORAGE_PATHS para generarla)
 * @param file - Archivo a subir (File o Blob)
 * @param options - Opciones de subida
 * @param options.upsert - Si true, reemplaza el archivo si ya existe
 * @returns Datos del archivo subido
 * @throws Error si falla la subida
 *
 * @example
 * const path = STORAGE_PATHS.rewards(businessId, 'reward-1.jpg');
 * await uploadFile(path, file, { upsert: true });
 */
export async function uploadFile(
	path: string,
	file: File | Blob,
	options?: { upsert?: boolean },
) {
	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(path, file, {
			cacheControl: "3600",
			upsert: options?.upsert ?? false,
		});

	if (error) throw error;
	return data;
}

/**
 * Obtiene la URL pública de un archivo almacenado
 *
 * @param path - Ruta completa del archivo en el bucket
 * @returns URL pública del archivo
 *
 * @example
 * const path = STORAGE_PATHS.businessLogos(businessId, 'logo.png');
 * const url = getPublicUrl(path);
 */
export function getPublicUrl(path: string): string {
	const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

	return data.publicUrl;
}

/**
 * Elimina un archivo del storage
 *
 * @param path - Ruta completa del archivo a eliminar
 * @throws Error si falla la eliminación
 *
 * @example
 * const path = STORAGE_PATHS.rewards(businessId, 'old-reward.jpg');
 * await deleteFile(path);
 */
export async function deleteFile(path: string) {
	const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

	if (error) throw error;
}

/**
 * Extrae la ruta relativa de una URL completa de storage
 *
 * @param url - URL completa del storage (ej: https://...puntofiel-assets/rewards/...)
 * @returns Ruta relativa (ej: rewards/uuid/file.jpg) o null si no es válida
 *
 * @example
 * const url = 'https://xyz.supabase.co/storage/v1/object/public/puntofiel-assets/rewards/123/img.jpg';
 * const path = extractPathFromUrl(url);
 * // path = 'rewards/123/img.jpg'
 */
export function extractPathFromUrl(url: string): string | null {
	const parts = url.split(`/${BUCKET_NAME}/`);
	return parts.length > 1 ? parts[1] : null;
}
