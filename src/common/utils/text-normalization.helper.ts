/**
 * Utilidades para normalización de texto
 */

/**
 * Normaliza un string eliminando acentos, convirtiendo a minúsculas,
 * eliminando espacios extra y caracteres especiales
 */
export function normalizeString(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .toLowerCase() // Convertir a minúsculas
        .normalize('NFD') // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)
        .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales, mantener letras, números y espacios
        .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
        .trim(); // Eliminar espacios al inicio y final
}

/**
 * Normaliza un nombre eliminando acentos, convirtiendo a minúsculas,
 * y manteniendo solo espacios simples entre palabras
 */
export function normalizeName(name: string): string {
    return normalizeString(name);
}

/**
 * Normaliza texto a minúsculas sin acentos para búsquedas y comparaciones
 * Útil para poblar campos normalizados en la base de datos
 */
export function normalizeToLowercase(text: string): string {
    return normalizeString(text);
}

/**
 * Capitaliza la primera letra de cada palabra después de normalizar
 */
export function normalizeAndCapitalize(text: string): string {
    const normalized = normalizeString(text);
    return normalized
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Normaliza un string para uso como slug (sin espacios, solo guiones)
 */
export function normalizeToSlug(text: string): string {
    return normalizeString(text)
        .replace(/\s+/g, '-') // Reemplazar espacios por guiones
        .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
        .replace(/^-|-$/g, ''); // Eliminar guiones al inicio y final
}
