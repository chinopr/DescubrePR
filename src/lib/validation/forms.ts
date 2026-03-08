import { BUSINESS_CATEGORIES, MUNICIPIOS } from '@/lib/constants/municipios';
import type { ListingType, UserRole } from '@/lib/types/database';

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  error: string;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const MUNICIPIOS_SET = new Set<string>(MUNICIPIOS);
const BUSINESS_CATEGORIES_SET = new Set<string>(BUSINESS_CATEGORIES);
const LISTING_TYPES = new Set<ListingType>(['servicio', 'producto', 'alquiler']);
const REGISTER_ROLES = new Set<UserRole>(['user', 'business']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(value: unknown) {
  const normalized = getString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeEmail(value: unknown) {
  return getString(value).toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizePhone(value: unknown) {
  const normalized = getOptionalString(value);
  if (!normalized) return null;

  return normalized.replace(/[^\d+()\-\s]/g, '').trim();
}

function isValidPhone(value: string | null) {
  if (!value) return true;

  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function sanitizeInstagram(value: unknown) {
  const normalized = getOptionalString(value);
  if (!normalized) return null;

  return normalized.replace(/^@+/, '').trim();
}

function sanitizeFotos(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

function validateMunicipio(value: string) {
  return MUNICIPIOS_SET.has(value);
}

function validateRequiredString(value: string, field: string, min: number, max: number) {
  if (value.length < min) {
    return `${field} es demasiado corto.`;
  }

  if (value.length > max) {
    return `${field} excede el largo permitido.`;
  }

  return null;
}

function validateOptionalMaxLength(value: string | null, field: string, max: number) {
  if (value && value.length > max) {
    return `${field} excede el largo permitido.`;
  }

  return null;
}

function validateDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validateLoginInput(payload: unknown): ValidationResult<{
  email: string;
  password: string;
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const email = normalizeEmail(payload.email);
  const password = getString(payload.password);

  if (!isValidEmail(email)) {
    return { success: false, error: 'Correo electrónico inválido.' };
  }

  if (password.length < 8 || password.length > 128) {
    return { success: false, error: 'La contraseña debe tener entre 8 y 128 caracteres.' };
  }

  return {
    success: true,
    data: { email, password },
  };
}

export function validateRegisterInput(payload: unknown): ValidationResult<{
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const nombre = getString(payload.nombre);
  const email = normalizeEmail(payload.email);
  const password = getString(payload.password);
  const rol = getString(payload.rol) as UserRole;

  const nombreError = validateRequiredString(nombre, 'El nombre', 2, 80);
  if (nombreError) return { success: false, error: nombreError };

  if (!isValidEmail(email)) {
    return { success: false, error: 'Correo electrónico inválido.' };
  }

  if (password.length < 8 || password.length > 128) {
    return { success: false, error: 'La contraseña debe tener entre 8 y 128 caracteres.' };
  }

  if (!REGISTER_ROLES.has(rol)) {
    return { success: false, error: 'Rol inválido.' };
  }

  return {
    success: true,
    data: { nombre, email, password, rol },
  };
}

export function validateBusinessSubmission(payload: unknown): ValidationResult<{
  nombre: string;
  descripcion: string | null;
  municipio: string;
  addressText: string | null;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  categorias: string[];
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const nombre = getString(payload.nombre);
  const descripcion = getOptionalString(payload.descripcion);
  const municipio = getString(payload.municipio);
  const addressText = getOptionalString(payload.addressText);
  const telefono = sanitizePhone(payload.telefono);
  const whatsapp = sanitizePhone(payload.whatsapp);
  const instagram = sanitizeInstagram(payload.instagram);
  const website = getOptionalString(payload.website);
  const categorias = Array.isArray(payload.categorias)
    ? Array.from(
        new Set(
          payload.categorias
            .filter((item): item is string => typeof item === 'string')
            .map(item => item.trim())
            .filter(Boolean)
        )
      )
    : [];

  const nombreError = validateRequiredString(nombre, 'El nombre del negocio', 2, 120);
  if (nombreError) return { success: false, error: nombreError };

  if (!validateMunicipio(municipio)) {
    return { success: false, error: 'Municipio inválido.' };
  }

  if (categorias.length === 0 || categorias.length > 3) {
    return { success: false, error: 'Selecciona entre 1 y 3 categorías.' };
  }

  if (!categorias.every(cat => BUSINESS_CATEGORIES_SET.has(cat))) {
    return { success: false, error: 'Una o más categorías son inválidas.' };
  }

  const descripcionError = validateOptionalMaxLength(descripcion, 'La descripción', 1200);
  if (descripcionError) return { success: false, error: descripcionError };

  const addressError = validateOptionalMaxLength(addressText, 'La dirección', 200);
  if (addressError) return { success: false, error: addressError };

  if (!isValidPhone(telefono) || !isValidPhone(whatsapp)) {
    return { success: false, error: 'Teléfono o WhatsApp inválido.' };
  }

  const instagramError = validateOptionalMaxLength(instagram, 'Instagram', 50);
  if (instagramError) return { success: false, error: instagramError };

  if (website && !isValidUrl(website)) {
    return { success: false, error: 'El website debe ser una URL válida.' };
  }

  return {
    success: true,
    data: {
      nombre,
      descripcion,
      municipio,
      addressText,
      telefono,
      whatsapp,
      instagram,
      website,
      categorias,
    },
  };
}

export function validateEventSubmission(payload: unknown): ValidationResult<{
  businessId: string | null;
  titulo: string;
  descripcion: string | null;
  startDatetime: string;
  endDatetime: string;
  municipio: string;
  costo: number;
  link: string | null;
  whatsapp: string | null;
  fotos: string[];
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const businessId = getOptionalString(payload.businessId);
  const titulo = getString(payload.titulo);
  const descripcion = getOptionalString(payload.descripcion);
  const startDatetime = getString(payload.startDatetime);
  const endDatetime = getString(payload.endDatetime);
  const municipio = getString(payload.municipio);
  const costoValue = typeof payload.costo === 'number' ? payload.costo : Number(getString(payload.costo) || '0');
  const link = getOptionalString(payload.link);
  const whatsapp = sanitizePhone(payload.whatsapp);
  const fotos = sanitizeFotos(payload.fotos, 5);

  const tituloError = validateRequiredString(titulo, 'El título', 3, 120);
  if (tituloError) return { success: false, error: tituloError };

  const descripcionError = validateOptionalMaxLength(descripcion, 'La descripción', 1500);
  if (descripcionError) return { success: false, error: descripcionError };

  if (!validateMunicipio(municipio)) {
    return { success: false, error: 'Municipio inválido.' };
  }

  const startDate = validateDateTime(startDatetime);
  const endDate = validateDateTime(endDatetime);
  if (!startDate || !endDate) {
    return { success: false, error: 'La fecha del evento es inválida.' };
  }

  if (endDate <= startDate) {
    return { success: false, error: 'La fecha de finalización debe ser posterior al inicio.' };
  }

  if (!Number.isFinite(costoValue) || costoValue < 0 || costoValue > 999999) {
    return { success: false, error: 'Costo inválido.' };
  }

  if (link && !isValidUrl(link)) {
    return { success: false, error: 'El enlace del evento debe ser una URL válida.' };
  }

  if (!isValidPhone(whatsapp)) {
    return { success: false, error: 'WhatsApp inválido.' };
  }

  return {
    success: true,
    data: {
      businessId,
      titulo,
      descripcion,
      startDatetime,
      endDatetime,
      municipio,
      costo: costoValue,
      link,
      whatsapp,
      fotos,
    },
  };
}

export function validatePromoSubmission(payload: unknown): ValidationResult<{
  businessId: string;
  titulo: string;
  descripcion: string | null;
  startDate: string;
  endDate: string;
  codigo: string | null;
  condiciones: string | null;
  fotos: string[];
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const businessId = getString(payload.businessId);
  const titulo = getString(payload.titulo);
  const descripcion = getOptionalString(payload.descripcion);
  const startDate = getString(payload.startDate);
  const endDate = getString(payload.endDate);
  const codigo = getOptionalString(payload.codigo)?.toUpperCase() || null;
  const condiciones = getOptionalString(payload.condiciones);
  const fotos = sanitizeFotos(payload.fotos, 3);

  if (!businessId) {
    return { success: false, error: 'Selecciona un negocio válido.' };
  }

  const tituloError = validateRequiredString(titulo, 'El título', 3, 120);
  if (tituloError) return { success: false, error: tituloError };

  const descripcionError = validateOptionalMaxLength(descripcion, 'La descripción', 1200);
  if (descripcionError) return { success: false, error: descripcionError };

  const start = validateDateOnly(startDate);
  const end = validateDateOnly(endDate);
  if (!start || !end) {
    return { success: false, error: 'Las fechas de la promoción son inválidas.' };
  }

  if (end < start) {
    return { success: false, error: 'La fecha final debe ser igual o posterior al inicio.' };
  }

  const codigoError = validateOptionalMaxLength(codigo, 'El código promocional', 40);
  if (codigoError) return { success: false, error: codigoError };

  const condicionesError = validateOptionalMaxLength(condiciones, 'Las condiciones', 200);
  if (condicionesError) return { success: false, error: condicionesError };

  return {
    success: true,
    data: {
      businessId,
      titulo,
      descripcion,
      startDate,
      endDate,
      codigo,
      condiciones,
      fotos,
    },
  };
}

export function validateServiceSubmission(payload: unknown): ValidationResult<{
  tipo: ListingType;
  titulo: string;
  descripcion: string | null;
  municipio: string;
  precio: number | null;
  telefono: string | null;
  whatsapp: string | null;
  fotos: string[];
}> {
  if (!isRecord(payload)) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const tipo = getString(payload.tipo) as ListingType;
  const titulo = getString(payload.titulo);
  const descripcion = getOptionalString(payload.descripcion);
  const municipio = getString(payload.municipio);
  const rawPrecio = getOptionalString(payload.precio);
  const precio = rawPrecio ? Number(rawPrecio) : null;
  const telefono = sanitizePhone(payload.telefono);
  const whatsapp = sanitizePhone(payload.whatsapp);
  const fotos = sanitizeFotos(payload.fotos, 5);

  if (!LISTING_TYPES.has(tipo)) {
    return { success: false, error: 'Tipo de anuncio inválido.' };
  }

  const tituloError = validateRequiredString(titulo, 'El título', 3, 120);
  if (tituloError) return { success: false, error: tituloError };

  const descripcionError = validateOptionalMaxLength(descripcion, 'La descripción', 1500);
  if (descripcionError) return { success: false, error: descripcionError };

  if (!validateMunicipio(municipio)) {
    return { success: false, error: 'Municipio inválido.' };
  }

  if (precio !== null && (!Number.isFinite(precio) || precio < 0 || precio > 999999)) {
    return { success: false, error: 'Precio inválido.' };
  }

  if (!isValidPhone(telefono) || !isValidPhone(whatsapp)) {
    return { success: false, error: 'Teléfono o WhatsApp inválido.' };
  }

  return {
    success: true,
    data: {
      tipo,
      titulo,
      descripcion,
      municipio,
      precio,
      telefono,
      whatsapp,
      fotos,
    },
  };
}
