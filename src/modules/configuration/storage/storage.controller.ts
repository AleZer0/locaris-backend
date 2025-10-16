import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { SimpleStorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { DeleteManyStorageDto, StorageItem } from './dto/batch-storage.dto';
import { UploadVehicleStorageDto } from './dto/upload-storage.dto';
import { UploadFilesMetadataDto } from './dto/upload-files-metadata.dto';
import { ResponseDto, ResponseStatus } from '@/common/dtos/response.dto';
import {
    StorageControllerDocs,
    FindAllStoragesDocs,
    FindOneStorageDocs,
    CreateStorageDocs,
    UpdateStorageDocs,
    DeleteStorageDocs,
    RecoverStorageDocs,
    DeleteManyStoragesDocs,
    GenerateUploadUrlsDocs,
    CreateAfterUploadDocs,
    UploadAndCreateMultipleDocs,
} from './docs/storage.docs';
import { StorageFilterDto } from './dto/filter-storage.dto';
import {
    StorageItemWhitUrlResponseDto,
    StorageResponseArrDto,
    StorageResponseObjDto,
    StorageWithUrlsResponseArrDto,
    StorageWithUrlsResponseObjDto,
    UploadMultipleResponseDto,
} from './dto/response-storage.dto';

@UseGuards(AuthGuard)
@StorageControllerDocs
@Controller('vehicles-storage')
export class SimpleStorageController {
    constructor(private readonly vehicleStorageService: SimpleStorageService) {}

    // ========================================
    // MÉTODOS CRUD BÁSICOS
    // ========================================

    @CreateStorageDocs
    @Post()
    async create(@Body() createStorageDto: CreateStorageDto): Promise<StorageResponseObjDto> {
        const data = await this.vehicleStorageService.create(createStorageDto);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivo creado exitosamente',
            data,
        };
    }

    @FindAllStoragesDocs
    @Get()
    async findAll(@Query() filters: StorageFilterDto): Promise<StorageWithUrlsResponseArrDto> {
        const { data, metadata } = await this.vehicleStorageService.findAll(filters);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Lista de archivos obtenida correctamente',
            data,
            metadata,
        };
    }

    @FindOneStorageDocs
    @Get(':mediaFileUuid')
    async findOne(@Param('mediaFileUuid') mediaFileUuid: string): Promise<StorageWithUrlsResponseObjDto> {
        const data = await this.vehicleStorageService.findOne(mediaFileUuid);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivo obtenido correctamente',
            data,
        };
    }

    @UpdateStorageDocs
    @Put(':mediaFileUuid')
    async update(
        @Param('mediaFileUuid') mediaFileUuid: string,
        @Body() updateStorageDto: UpdateStorageDto
    ): Promise<StorageWithUrlsResponseObjDto> {
        const data = await this.vehicleStorageService.update(mediaFileUuid, updateStorageDto);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivo actualizado exitosamente',
            data,
        };
    }

    @DeleteStorageDocs
    @Delete(':mediaFileUuid')
    async remove(@Param('mediaFileUuid') mediaFileUuid: string): Promise<ResponseDto> {
        await this.vehicleStorageService.remove(mediaFileUuid);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivo eliminado exitosamente',
        };
    }

    @RecoverStorageDocs
    @Post(':mediaFileUuid/recover')
    async recover(@Param('mediaFileUuid') mediaFileUuid: string): Promise<ResponseDto> {
        await this.vehicleStorageService.recover(mediaFileUuid);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivo recuperado exitosamente',
        };
    }

    // ========================================
    // MÉTODOS BATCH
    // ========================================

    @DeleteManyStoragesDocs
    @Delete('batch/delete')
    async removeMany(@Body() deleteManyDto: DeleteManyStorageDto): Promise<ResponseDto> {
        await this.vehicleStorageService.removeMany(deleteManyDto.uuids);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivos eliminados exitosamente',
        };
    }

    // ========================================
    // MÉTODOS DE STORAGE CON S3
    // ========================================

    @GenerateUploadUrlsDocs
    @Post('generate-upload-urls')
    async generateUploadUrls(@Body() itemsToUpload: StorageItem[]): Promise<StorageItemWhitUrlResponseDto> {
        const data = await Promise.all(itemsToUpload.map(item => this.vehicleStorageService.generateUploadUrls(item)));

        return {
            status: ResponseStatus.SUCCESS,
            message: 'URLs de subida generadas exitosamente',
            data,
        };
    }

    @CreateAfterUploadDocs
    @Post('create-after-upload')
    async createAfterUpload(
        @Body()
        itemsToCreate: CreateStorageDto[]
    ): Promise<StorageResponseArrDto> {
        const data = await Promise.all(itemsToCreate.map(item => this.vehicleStorageService.createAfterUpload(item)));
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivos creados exitosamente después de subida',
            data,
        };
    }

    @UploadAndCreateMultipleDocs
    @Post('upload-and-create-multiple')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadAndCreateMultiple(
        @UploadedFiles() files: any[],
        @Body() body: any
    ): Promise<UploadMultipleResponseDto> {
        // Parsear metadatos desde el body
        let metadata: UploadFilesMetadataDto[];

        try {
            // Si metadata viene como string JSON, parsearlo
            metadata = typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata;

            if (!metadata || !Array.isArray(metadata)) {
                throw new Error('Metadata debe ser un array válido');
            }

            if (files.length !== metadata.length) {
                throw new Error(
                    `Número de archivos (${files.length}) no coincide con número de metadatos (${metadata.length})`
                );
            }
        } catch (error) {
            throw new Error(`Error parseando metadatos: ${error.message}`);
        }

        // Combinar archivos con metadatos
        const filesToUpload: UploadVehicleStorageDto[] = files.map((file, index) => {
            const fileMetadata = metadata[index];
            return {
                content: file.buffer,
                bucket: fileMetadata.bucket,
                objectKey: fileMetadata.objectKey,
                contentType: file.mimetype,
                mediaFileType: fileMetadata.mediaFileType as any,
                referenceType: fileMetadata.referenceType as any,
                referenceId: fileMetadata.referenceId,
                secondReferenceId: fileMetadata.secondReferenceId,
                description: fileMetadata.description,
                createdBy: fileMetadata.createdBy,
                metadata: fileMetadata.metadata,
                tags: fileMetadata.tags,
            };
        });

        const data = await this.vehicleStorageService.uploadAndCreateMultiple(filesToUpload);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Archivos procesados exitosamente',
            data,
        };
    }
}
