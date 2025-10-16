import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '@/storage/storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { StorageDto } from './dto/storage.dto';
import { StorageSimple } from './dto/storage.dto';
import { GeneralStatus, Prisma, Storage } from 'generated/prisma';
import { PaginationHelper } from '@/common/utils/pagination.helper';
import { StorageFilterDto } from './dto/filter-storage.dto';
import { ResponseStatus } from '@/common/dtos/response.dto';
import { StorageItem, StorageItemWithUrls } from './dto/batch-storage.dto';
import { UploadVehicleStorageDto } from './dto/upload-storage.dto';
import { UploadFileDto } from '@/storage/dto/upload-files.dto';

@Injectable()
export class VehicleStorageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService
    ) {}

    // ========================================
    // MÉTODOS CRUD BÁSICOS
    // ========================================

    async create(data: CreateStorageDto): Promise<StorageDto> {
        await this.findByBucketAndObjectKey(data.bucket, data.objectKey);

        return this.prisma.storage.create({ data });
    }

    async findAll(filters: StorageFilterDto) {
        const allowedSortFields = [
            'mediaFileId',
            'mediaFileUuid',
            'contentType',
            'contentLength',
            'lastModified',
            'mediaFileType',
            'referenceType',
            'referenceId',
            'secondReferenceId',
        ];
        const sortBy = PaginationHelper.validateSortField(filters.sortBy || 'mediaFileId', allowedSortFields);
        const sortOrder = (filters.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

        const where: Prisma.StorageWhereInput = { deletedAt: null };

        // Filtros básicos
        if (filters.status) where.status = filters.status;
        if (filters.mediaFileType) where.mediaFileType = filters.mediaFileType;
        if (filters.referenceType) where.referenceType = filters.referenceType;
        if (filters.referenceId) where.referenceId = filters.referenceId;
        if (filters.secondReferenceId) where.secondReferenceId = filters.secondReferenceId;
        if (filters.createdBy) where.createdBy = filters.createdBy;

        // Búsqueda general
        if (filters.search) {
            where.OR = [
                { bucket: { contains: filters.search, mode: 'insensitive' } },
                { objectKey: { contains: filters.search, mode: 'insensitive' } },
                { contentType: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Solo paginar si se especifican parámetros de paginación
        const shouldPaginate = filters.page !== undefined || filters.limit !== undefined;
        const skip = shouldPaginate ? PaginationHelper.getSkipCount(filters.page ?? 1, filters.limit ?? 50) : undefined;
        const take = shouldPaginate ? (filters.limit ?? 50) : undefined;

        const [rowData, total] = await this.prisma.$transaction([
            this.prisma.storage.findMany({
                where,
                ...(skip !== undefined && { skip }),
                ...(take !== undefined && { take }),
                orderBy: [{ [sortBy]: sortOrder }, { mediaFileId: 'asc' }],
            }),
            this.prisma.storage.count({ where }),
        ]);

        const data = await Promise.all(rowData.map(storage => this.addDownloadUrl(storage)));
        const metadata = PaginationHelper.createMetadata(filters, total);

        return { data, metadata };
    }

    async findOne(mediaFileUuid: string): Promise<StorageDto> {
        const storage = await this.prisma.storage.findUnique({ where: { mediaFileUuid } });

        if (!storage) {
            throw new NotFoundException({
                status: ResponseStatus.ERROR,
                message: 'Archivo no encontrado',
            });
        }

        return this.addDownloadUrl(storage);
    }

    async update(mediaFileUuid: string, data: UpdateStorageDto): Promise<StorageDto> {
        await this.findOne(mediaFileUuid);

        if (data.bucket && data.objectKey) {
            await this.findByBucketAndObjectKey(data.bucket, data.objectKey, mediaFileUuid);
        }

        const storage = await this.prisma.storage.update({ where: { mediaFileUuid }, data });

        return this.addDownloadUrl(storage);
    }

    async remove(mediaFileUuid: string): Promise<void> {
        const storage = await this.findOne(mediaFileUuid);

        if (storage.status === GeneralStatus.inactive && storage.deletedAt) {
            throw new ConflictException({
                status: ResponseStatus.ERROR,
                message: 'El archivo ya está inactivo',
            });
        }

        await this.prisma.storage.update({
            where: { mediaFileUuid },
            data: { status: GeneralStatus.inactive, deletedAt: new Date() },
        });
    }

    async recover(mediaFileUuid: string): Promise<void> {
        const storage = await this.findOne(mediaFileUuid);

        if (storage.status === GeneralStatus.active && !storage.deletedAt) {
            throw new ConflictException({
                status: ResponseStatus.ERROR,
                message: 'El archivo ya está activo',
            });
        }

        await this.prisma.storage.update({
            where: { mediaFileUuid },
            data: { status: GeneralStatus.active, deletedAt: null },
        });
    }

    // ========================================
    // MÉTODOS BATCH
    // ========================================

    /**
     * Elimina múltiples archivos por UUIDs
     */
    async removeMany(mediaFileUuids: string[]): Promise<void> {
        // Verificar que todos los archivos existan
        const storages = await this.prisma.storage.findMany({
            where: { mediaFileUuid: { in: mediaFileUuids } },
        });

        if (storages.length !== mediaFileUuids.length) {
            const found = storages.map(s => s.mediaFileUuid);
            const missing = mediaFileUuids.filter(uuid => !found.includes(uuid));
            throw new NotFoundException({
                status: ResponseStatus.ERROR,
                message: `Archivos no encontrados: ${missing.join(', ')}`,
            });
        }

        // Verificar que no estén ya inactivos
        const alreadyInactive = storages.filter(s => s.status === GeneralStatus.inactive && s.deletedAt);
        if (alreadyInactive.length > 0) {
            const inactiveUuids = alreadyInactive.map(s => s.mediaFileUuid);
            throw new ConflictException({
                status: ResponseStatus.ERROR,
                message: `Los siguientes archivos ya están inactivos: ${inactiveUuids.join(', ')}`,
            });
        }

        // Marcar todos como inactivos
        await this.prisma.storage.updateMany({
            where: { mediaFileUuid: { in: mediaFileUuids } },
            data: { status: GeneralStatus.inactive, deletedAt: new Date() },
        });
    }

    /**
     * Sube múltiples archivos directamente a S3 y crea los registros en la base de datos
     */
    async uploadAndCreateMultiple(files: UploadVehicleStorageDto[]): Promise<{
        successful: StorageDto[];
        failed: Array<{
            objectKey: string;
            error: string;
        }>;
    }> {
        // Validar que no existan archivos con las mismas combinaciones bucket/objectKey
        for (const fileData of files) {
            await this.checkBucketAndObjectKeyAvailability(fileData.bucket, fileData.objectKey);
        }

        // Preparar datos para la subida a S3
        const s3Files: UploadFileDto[] = files.map(fileData => ({
            key: fileData.objectKey,
            content: fileData.content,
            contentType: fileData.contentType,
            metadata: fileData.metadata,
            tags: fileData.tags,
        }));

        // Subir archivos a S3
        const uploadResults = await this.storageService.uploadMultipleFiles(s3Files);

        const successful: StorageDto[] = [];
        const failed: Array<{ objectKey: string; error: string }> = [];

        // Procesar resultados
        for (let i = 0; i < uploadResults.length; i++) {
            const uploadResult = uploadResults[i];
            const originalFileData = files[i];

            if (uploadResult.success && uploadResult.result) {
                try {
                    // Crear registro en la base de datos
                    const storageData: CreateStorageDto = {
                        bucket: originalFileData.bucket,
                        objectKey: originalFileData.objectKey,
                        versionId: uploadResult.result.versionId,
                        contentType: originalFileData.contentType || 'application/octet-stream',
                        etag: uploadResult.result.etag,
                        lastModified: new Date().toISOString(),
                        mediaFileType: originalFileData.mediaFileType as any,
                        referenceType: originalFileData.referenceType as any,
                        referenceId: originalFileData.referenceId,
                        secondReferenceId: originalFileData.secondReferenceId,
                        description: originalFileData.description,
                        createdBy: originalFileData.createdBy,
                    };

                    const storage = await this.prisma.storage.create({ data: storageData });
                    successful.push(storage);
                } catch (error) {
                    // Si falla la creación del registro, el archivo ya está en S3
                    // pero no tenemos registro en BD
                    failed.push({
                        objectKey: originalFileData.objectKey,
                        error: `Error al crear registro en BD: ${error.message}`,
                    });
                }
            } else {
                failed.push({
                    objectKey: originalFileData.objectKey,
                    error: uploadResult.error || 'Error desconocido en la subida',
                });
            }
        }

        return { successful, failed };
    }

    // ========================================
    // MÉTODOS AUXILIARES
    // ========================================

    async findByReferenceId(referenceId: number): Promise<StorageSimple | null> {
        const itemInStorage = await this.prisma.storage.findFirst({
            where: {
                referenceId,
                status: GeneralStatus.active,
                deletedAt: null,
            },
        });

        if (!itemInStorage) {
            return null;
        }

        return this.addDownloadUrl(itemInStorage);
    }

    /**
     * Cuenta los archivos asignados a un referenceId y secondReferenceId específicos
     */
    async countFilesByReference(referenceId: number, secondReferenceId?: number): Promise<number> {
        const where: Prisma.StorageWhereInput = {
            referenceId,
            status: GeneralStatus.active,
            deletedAt: null,
        };

        if (secondReferenceId !== undefined) {
            where.secondReferenceId = secondReferenceId;
        }

        return this.prisma.storage.count({ where });
    }

    /**
     * Genera URLs firmadas para subida sin crear registros (Fase 1)
     * Solo devuelve las URLs necesarias para que el cliente suba archivos
     */
    async generateUploadUrls(data: StorageItem): Promise<StorageItemWithUrls> {
        // Validar que no exista un archivo con el mismo bucket y objectKey
        if (data.bucket && data.objectKey) {
            await this.checkBucketAndObjectKeyAvailability(data.bucket, data.objectKey);
        }

        // Generar URL de subida firmada
        const uploadUrl = await this.storageService.getUploadUrl(
            data.objectKey,
            data.contentType || 'application/octet-stream'
        );

        return {
            bucket: data.bucket,
            objectKey: data.objectKey,
            contentType: data.contentType,
            uploadUrl,
        };
    }

    /**
     * Crea el registro en storage con información completa obtenida de S3 (Fase 2)
     * El archivo ya debe existir en S3 para obtener los metadatos reales
     */
    async createAfterUpload(data: CreateStorageDto): Promise<StorageDto> {
        try {
            // Obtener información real del archivo desde S3
            const fileInfo = await this.storageService.headObject(data.objectKey, data.versionId || undefined);

            // Crear el registro con toda la información completa
            const completeData: CreateStorageDto = {
                ...data,
                contentType: fileInfo.contentType,
                contentLength: fileInfo.contentLength?.toString(),
                etag: fileInfo.eTag,
                lastModified: new Date().toISOString(),
                versionId: fileInfo.versionId || data.versionId,
            };

            const storage = await this.prisma.storage.create({ data: completeData });

            return storage;
        } catch {
            // Si el archivo no existe en S3, lanzar error específico
            throw new NotFoundException({
                status: ResponseStatus.ERROR,
                message: `El archivo ${data.objectKey} no existe. Asegúrate de haber subido el archivo antes de crear el registro.`,
            });
        }
    }

    /**
     * Método auxiliar para verificar disponibilidad de bucket/objectKey sin crear registro
     */
    private async checkBucketAndObjectKeyAvailability(bucket: string, objectKey: string): Promise<void> {
        const existingStorage = await this.prisma.storage.findFirst({
            where: {
                bucket: { equals: bucket, mode: 'insensitive' },
                objectKey: { equals: objectKey, mode: 'insensitive' },
                status: GeneralStatus.active,
                deletedAt: null,
            },
        });

        if (existingStorage) {
            throw new ConflictException({
                status: ResponseStatus.ERROR,
                message: `Ya existe un archivo con el bucket "${bucket}" y clave "${objectKey}".`,
            });
        }
    }

    async findByBucketAndObjectKey(
        bucket: string,
        objectKey: string,
        excludedMediaFileUuid?: string
    ): Promise<StorageDto | null> {
        const storage = await this.prisma.storage.findFirst({
            where: {
                bucket: { equals: bucket, mode: 'insensitive' },
                objectKey: { equals: objectKey, mode: 'insensitive' },
                status: GeneralStatus.active,
                deletedAt: null,
                ...(excludedMediaFileUuid ? { mediaFileUuid: { not: excludedMediaFileUuid } } : {}),
            },
        });

        if (storage) {
            throw new ConflictException({
                status: ResponseStatus.ERROR,
                message: `Ya existe un archivo con el bucket "${bucket}" y clave "${objectKey}".`,
            });
        }

        return storage;
    }

    /**
     * Transforma un StorageDto en StorageSimple incluyendo URLs firmadas
     */
    private async addDownloadUrl(storage: Storage): Promise<StorageSimple> {
        // Obtener URL de descarga firmada y información del archivo
        const downloadUrl = await this.storageService.getDownloadUrl(storage.objectKey, storage.versionId || undefined);

        return {
            mediaFileUuid: storage.mediaFileUuid,
            mediaFileType: storage.mediaFileType,
            referenceType: storage.referenceType,
            referenceId: storage.referenceId,
            secondReferenceId: storage.secondReferenceId,
            bucket: storage.bucket,
            objectKey: storage.objectKey,
            versionId: storage.versionId,
            contentType: storage.contentType,
            contentLength: storage.contentLength,
            etag: storage.etag,
            lastModified: storage.lastModified,
            checksum: storage.checksum,
            description: storage.description,
            status: storage.status,
            createdAt: storage.createdAt,
            updatedAt: storage.updatedAt,
            deletedAt: storage.deletedAt,
            createdBy: storage.createdBy,
            downloadUrl,
        };
    }
}
