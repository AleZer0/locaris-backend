import { ApiProperty } from '@nestjs/swagger';
import { MediaFileType, ReferenceType, GeneralStatus } from 'generated/prisma';

export class StorageDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    mediaFileUuid: string;

    @ApiProperty({ enum: MediaFileType, example: MediaFileType.image })
    mediaFileType: MediaFileType;

    @ApiProperty({ enum: ReferenceType, example: ReferenceType.vehicle })
    referenceType: ReferenceType;

    @ApiProperty({ example: 1 })
    referenceId: number;

    @ApiProperty({ example: 2, required: false, nullable: true })
    secondReferenceId: number | null;

    @ApiProperty({ example: 'valnex-files' })
    bucket: string;

    @ApiProperty({ example: 'vehicles/images/vehicle-123.jpg' })
    objectKey: string;

    @ApiProperty({ example: 'v1.0', required: false })
    versionId: string | null;

    @ApiProperty({ example: 'image/jpeg', required: false, nullable: true })
    contentType: string | null;

    @ApiProperty({ example: '1024000', required: false, nullable: true })
    contentLength: string | null;

    @ApiProperty({ example: 'd41d8cd98f00b204e9800998ecf8427e', required: false })
    etag: string | null;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false, nullable: true })
    lastModified: Date | null;

    @ApiProperty({ example: 'sha256:abc123...', required: false })
    checksum: string | null;

    @ApiProperty({ example: 'Imagen frontal del vehículo', required: false })
    description: string | null;

    @ApiProperty({ enum: GeneralStatus, example: GeneralStatus.active })
    status: GeneralStatus;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ example: null })
    deletedAt: Date | null;

    @ApiProperty({ example: 1, required: false })
    createdBy: number | null;
}

export class Storage extends StorageDto {
    // URLs firmadas
    @ApiProperty({
        example: 'https://s3.amazonaws.com/bucket/key?signed-url',
        description: 'URL firmada para descarga del archivo',
    })
    downloadUrl?: string;

    @ApiProperty({
        example: 'https://s3.amazonaws.com/bucket/key?upload-signed-url',
        description: 'URL firmada para subida del archivo',
        required: false,
    })
    uploadUrl?: string;
}
