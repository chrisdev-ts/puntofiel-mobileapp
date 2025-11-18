import { supabase } from '@/src/infrastructure/services/supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1200;
const BUCKET_NAME = 'puntofiel-assets';

type AssetType = 'promotions' | 'rewards' | 'business' | 'employees';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

interface UploadOptions {
  assetType: AssetType;
  businessId: string;
  fileName: string;
  entityId?: string;
}

class ImageUploadService {
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[ImageUploadService] Error al solicitar permisos de cámara:', error);
      return false;
    }
  }

  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[ImageUploadService] Error al solicitar permisos de galería:', error);
      return false;
    }
  }

  async takePhoto(): Promise<string | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        throw new Error('Permiso de cámara denegado');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('[ImageUploadService] Error al tomar foto:', error);
      throw error;
    }
  }

  async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error('Permiso de galería denegado');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('[ImageUploadService] Error al seleccionar imagen:', error);
      throw error;
    }
  }

  private async resizeImageIfNeeded(uri: string): Promise<string> {
    try {
      // Obtener tamaño usando fetch
      const response = await fetch(uri);
      const blob = await response.blob();

      console.log('[ImageUploadService] Tamaño original:', blob.size, 'bytes');

      // Si es menor a 5MB, no redimensionar
      if (blob.size < MAX_FILE_SIZE) {
        console.log('[ImageUploadService] Imagen dentro del límite de tamaño');
        return uri;
      }

      console.log('[ImageUploadService] Redimensionando imagen...');

      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: MAX_DIMENSION, height: MAX_DIMENSION } }],
        {
          compress: 0.7,
          format: SaveFormat.JPEG,
        }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('[ImageUploadService] Error al redimensionar:', error);
      return uri;
    }
  }

  /**
   * Convierte un Blob a ArrayBuffer
   */
  private async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo convertir a ArrayBuffer'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * ✅ Limpia el nombre del archivo: elimina espacios, caracteres especiales y genera un nombre seguro
   */
  private sanitizeFileName(fileName: string): string {
    // 1. Remover espacios en blanco al inicio y final
    let clean = fileName.trim();

    // 2. Separar el nombre y la extensión
    const parts = clean.split('.');
    const ext = parts.pop() || 'jpg';
    const name = parts.join('.');

    // 3. Reemplazar espacios, caracteres especiales y acentos con guiones
    clean = name
      .toLowerCase()
      .replace(/\s+/g, '-') // Espacios → guiones
      .replace(/[áàäâ]/g, 'a') // Acentos á → a
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9-]/g, '') // Solo alphanumericos y guiones
      .replace(/--+/g, '-') // Múltiples guiones → un guion
      .replace(/^-+|-+$/g, ''); // Remover guiones al inicio/final

    // 4. Si quedó vacío, usar valor por defecto
    if (!clean) {
      clean = 'image';
    }

    // 5. Retornar con extensión original
    return `${clean}.${ext}`;
  }

  async uploadImage(
    uri: string,
    options: UploadOptions
  ): Promise<UploadResponse> {
    try {
      console.log('[ImageUploadService] 📤 Iniciando carga:', { uri, options });

      const resizedUri = await this.resizeImageIfNeeded(uri);

      // Obtener blob de la imagen
      const response = await fetch(resizedUri);
      const blob = await response.blob();

      console.log('[ImageUploadService] Blob obtenido:', blob.size, 'bytes', blob.type);

      // Validar tipo
      if (!blob.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Solo se permiten imágenes',
        };
      }

      // Validar tamaño
      if (blob.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Archivo demasiado grande. Máximo: 5MB. Tamaño: ${(
            blob.size /
            1024 /
            1024
          ).toFixed(2)}MB`,
        };
      }

      // Convertir a ArrayBuffer
      console.log('[ImageUploadService] Convirtiendo a ArrayBuffer...');
      const arrayBuffer = await this.blobToArrayBuffer(blob);

      // ✅ Construir path - LIMPIO Y SIN ESPACIOS
      const timestamp = Date.now();
      const fileExt = options.fileName.split('.').pop() || 'jpg';
      
      // ✅ USAR sanitizeFileName para limpiar el nombre
      const cleanFileName = this.sanitizeFileName(options.fileName);
      
      // ✅ Construir path con nombre limpio
      const path = `${options.assetType}/${options.businessId}/${timestamp}-${cleanFileName}`;

      console.log('[ImageUploadService] 📍 Path limpio:', path);
      console.log('[ImageUploadService] 🪣 Bucket:', BUCKET_NAME);
      console.log('[ImageUploadService] 📤 Subiendo ArrayBuffer...');

      // Upload a Supabase Storage con ArrayBuffer
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, arrayBuffer, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('[ImageUploadService] ❌ Error Supabase:', error);
        return {
          success: false,
          error: `Error al subir imagen: ${error.message}`,
        };
      }

      console.log('[ImageUploadService] ✅ Archivo subido:', data);

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      const publicUrl = publicUrlData.publicUrl;
      console.log('[ImageUploadService] 🔗 URL pública:', publicUrl);
      console.log('[ImageUploadService] ✅ Detalles de la URL:', {
      path,
      publicUrl,
      bucket: BUCKET_NAME,
    });

      return {
        success: true,
        url: publicUrl,
        path,
      };
    } catch (error) {
      console.error('[ImageUploadService] ⚠️ Error fatal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir imagen';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteImage(assetPath: string): Promise<boolean> {
    try {
      console.log('[ImageUploadService] 🗑️ Eliminando:', assetPath);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([assetPath]);

      if (error) {
        console.error('[ImageUploadService] Error al eliminar:', error);
        return false;
      }

      console.log('[ImageUploadService] ✅ Imagen eliminada');
      return true;
    } catch (error) {
      console.error('[ImageUploadService] Error en deleteImage:', error);
      return false;
    }
  }
}

export const imageUploadService = new ImageUploadService();