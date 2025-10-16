import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiOkResponse,
    ApiParam,
    ApiNotFoundResponse,
    ApiCreatedResponse,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiCookieAuth,
    ApiTags,
} from '@nestjs/swagger';
import { CreateStorageDto } from '../dto/create-storage.dto';
import { UpdateStorageDto } from '../dto/update-storage.dto';
import { StorageResponseArrDto, StorageResponseObjDto } from '../dto/response-storage.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import { ErrorAuthResponseDto } from '@/modules/auth/dto/response-auth.dto';

export const StorageControllerDocs = applyDecorators(
    ApiTags('Alamacenamiento de Vehículos'),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({
        description: 'Error de autenticación. Por favor inicia sesión.',
        type: ErrorAuthResponseDto,
        example: {
            status: ResponseStatus.ERROR,
            message: 'Error de autenticación. Por favor inicia sesión.',
            code: 'AUTH_ERROR',
        },
    })
);

export const CreateStorageDocs = applyDecorators(
    ApiOperation({
        summary: 'Subir un nuevo archivo',
        description: 'Registra un nuevo archivo en el sistema de almacenamiento.',
    }),
    ApiBody({ type: CreateStorageDto, description: 'Datos para registrar un nuevo archivo' }),
    ApiCreatedResponse({ description: 'Archivo creado exitosamente', type: StorageResponseObjDto })
);

export const FindAllStoragesDocs = applyDecorators(
    ApiOperation({
        summary: 'Obtener todos los archivos',
        description: 'Devuelve una lista paginada de todos los archivos activos del sistema.',
    }),
    ApiOkResponse({
        description: 'Lista de archivos',
        type: StorageResponseArrDto,
    })
);

export const FindOneStorageDocs = applyDecorators(
    ApiOperation({
        summary: 'Obtener un archivo por UUID',
        description: 'Devuelve los detalles de un archivo específico por su UUID.',
    }),
    ApiParam({ name: 'mediaFileUuid', description: 'UUID del archivo' }),
    ApiOkResponse({ description: 'Detalles del archivo', type: StorageResponseObjDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Archivo no encontrado' })
);

export const UpdateStorageDocs = applyDecorators(
    ApiOperation({
        summary: 'Actualizar un archivo',
        description: 'Actualiza los metadatos de un archivo existente por su UUID.',
    }),
    ApiParam({ name: 'mediaFileUuid', description: 'UUID del archivo' }),
    ApiBody({ type: UpdateStorageDto, description: 'Datos para actualizar un archivo existente' }),
    ApiOkResponse({ description: 'Archivo actualizado exitosamente', type: StorageResponseObjDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Archivo no encontrado' })
);

export const DeleteStorageDocs = applyDecorators(
    ApiOperation({
        summary: 'Eliminar un archivo',
        description: 'Elimina un archivo específico por su UUID (soft delete).',
    }),
    ApiParam({ name: 'mediaFileUuid', description: 'UUID del archivo' }),
    ApiOkResponse({ description: 'Archivo eliminado exitosamente', type: ResponseDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Archivo no encontrado' })
);

export const RecoverStorageDocs = applyDecorators(
    ApiOperation({
        summary: 'Recuperar un archivo',
        description: 'Recupera un archivo eliminado por su UUID.',
    }),
    ApiParam({ name: 'mediaFileUuid', description: 'UUID del archivo' }),
    ApiOkResponse({ description: 'Archivo recuperado exitosamente', type: ResponseDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Archivo no encontrado' })
);

export const DeleteManyStoragesDocs = applyDecorators(
    ApiOperation({
        summary: 'Eliminar múltiples archivos',
        description: 'Elimina múltiples archivos por sus UUIDs (soft delete).',
    }),
    ApiBody({
        description: 'Lista de UUIDs de archivos a eliminar',
        schema: {
            type: 'object',
            properties: {
                uuids: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['uuid-1', 'uuid-2', 'uuid-3'],
                },
            },
        },
    }),
    ApiOkResponse({ description: 'Archivos eliminados exitosamente', type: ResponseDto }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Uno o más archivos no encontrados' })
);

export const GenerateUploadUrlsDocs = applyDecorators(
    ApiOperation({
        summary: 'Generar URLs de subida firmadas',
        description: 'Genera URLs firmadas para subir archivos a S3 sin crear registros en base de datos.',
    }),
    ApiBody({
        description: 'Lista de archivos para generar URLs de subida',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    bucket: { type: 'string', example: 'my-bucket' },
                    objectKey: { type: 'string', example: 'vehicles/images/vehicle-123.jpg' },
                    contentType: { type: 'string', example: 'image/jpeg' },
                    versionId: { type: 'string', example: 'v1.0' },
                },
                required: ['bucket', 'objectKey'],
            },
        },
    }),
    ApiOkResponse({
        description: 'URLs de subida generadas exitosamente',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                message: { type: 'string', example: 'URLs de subida generadas exitosamente' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            bucket: { type: 'string' },
                            objectKey: { type: 'string' },
                            contentType: { type: 'string' },
                            uploadUrl: { type: 'string' },
                        },
                    },
                },
            },
        },
    })
);

export const CreateAfterUploadDocs = applyDecorators(
    ApiOperation({
        summary: 'Crear registros después de subida',
        description: 'Crea registros en base de datos para archivos ya subidos a S3, obteniendo metadatos reales.',
    }),
    ApiBody({
        description: 'Lista de archivos para crear registros después de subida',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    mediaFileType: { type: 'string', example: 'image' },
                    referenceType: { type: 'string', example: 'vehicle' },
                    referenceId: { type: 'number', example: 1 },
                    secondReferenceId: { type: 'number', example: 2 },
                    bucket: { type: 'string', example: 'my-bucket' },
                    objectKey: { type: 'string', example: 'vehicles/images/vehicle-123.jpg' },
                    contentType: { type: 'string', example: 'image/jpeg' },
                    versionId: { type: 'string', example: 'v1.0' },
                    description: { type: 'string', example: 'Imagen del vehículo' },
                    createdBy: { type: 'number', example: 1 },
                },
                required: ['mediaFileType', 'referenceType', 'referenceId', 'bucket', 'objectKey'],
            },
        },
    }),
    ApiOkResponse({
        description: 'Archivos creados exitosamente después de subida',
        example: {
            status: 'success',
            message: 'Archivos creados exitosamente después de subida',
            data: [
                {
                    mediaFileId: 1,
                    mediaFileUuid: 'uuid-1',
                    mediaFileType: 'image',
                    referenceType: 'vehicle',
                    referenceId: 1,
                    secondReferenceId: null,
                    bucket: 'my-bucket',
                    objectKey: 'vehicles/images/vehicle-123.jpg',
                    contentType: 'image/jpeg',
                    contentLength: 204800,
                    versionId: 'v1.0',
                    url: 'https://my-bucket.s3.amazonaws.com/vehicles/images/vehicle-123.jpg',
                    description: 'Imagen del vehículo',
                    createdBy: 1,
                    createdAt: '2025-08-06T12:00:00Z',
                },
            ],
        },
    }),
    ApiNotFoundResponse({ type: ResponseDto, description: 'Uno o más archivos no existen en S3' })
);

export const UploadAndCreateMultipleDocs = applyDecorators(
    ApiOperation({
        summary: 'Subir múltiples archivos directamente',
        description:
            'Sube múltiples archivos binarios directamente a S3 y crea los registros en la base de datos usando multipart/form-data.',
    }),
    ApiBody({
        description: 'Archivos binarios y metadatos usando multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                        description: 'Archivo binario',
                    },
                    description: 'Array de archivos binarios',
                },
                metadata: {
                    type: 'string',
                    description: 'JSON string con array de metadatos correspondiente a cada archivo (mismo orden)',
                    example: JSON.stringify([
                        {
                            bucket: 'valnex-vehicles',
                            objectKey: 'vehicles/123/frontal.jpg',
                            mediaFileType: 'VEHICLE_PHOTO',
                            referenceType: 'VEHICLE',
                            referenceId: 123,
                            secondReferenceId: 456,
                            description: 'Foto frontal del vehículo',
                            createdBy: 1,
                            metadata: '{"author": "Juan Pérez", "department": "Ventas"}',
                            tags: '{"Environment": "production", "Project": "vehicle-management"}',
                        },
                    ]),
                },
            },
            required: ['files', 'metadata'],
        },
    }),
    ApiOkResponse({
        description: 'Archivos procesados exitosamente',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                message: { type: 'string', example: 'Archivos procesados exitosamente' },
                data: {
                    type: 'object',
                    properties: {
                        successful: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    mediaFileId: { type: 'number', example: 1 },
                                    mediaFileUuid: { type: 'string', example: 'uuid-123' },
                                    mediaFileType: { type: 'string', example: 'VEHICLE_PHOTO' },
                                    referenceType: { type: 'string', example: 'VEHICLE' },
                                    referenceId: { type: 'number', example: 123 },
                                    bucket: { type: 'string', example: 'my-bucket' },
                                    objectKey: { type: 'string', example: 'vehicles/images/vehicle-123.jpg' },
                                    contentType: { type: 'string', example: 'image/jpeg' },
                                    etag: { type: 'string', example: '"abc123"' },
                                    versionId: { type: 'string', example: 'v1.0' },
                                    createdAt: { type: 'string', example: '2025-10-04T12:00:00Z' },
                                },
                            },
                        },
                        failed: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    objectKey: { type: 'string', example: 'vehicles/images/failed-file.jpg' },
                                    error: { type: 'string', example: 'Upload failed: Invalid file format' },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
);
