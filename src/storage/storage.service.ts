import { Injectable } from '@nestjs/common';
import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/storage/s3.client';
import { ConfigService } from '@/config/config.service';
import { UploadFileDto } from './dto/upload-files.dto';

@Injectable()
export class StorageService {
    constructor(private readonly configService: ConfigService) {}

    async getUploadUrl(key: string, contentType = 'application/octet-stream', expires = 900) {
        const cmd = new PutObjectCommand({
            Bucket: this.configService.s3Bucket,
            Key: key,
            ContentType: contentType,
        });
        return getSignedUrl(s3, cmd, { expiresIn: expires });
    }

    async uploadFile(file: UploadFileDto) {
        const tagging = file?.tags
            ? Object.entries(file.tags)
                  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                  .join('&')
            : undefined;

        const cmd = new PutObjectCommand({
            Bucket: this.configService.s3Bucket,
            Key: file.key,
            Body: file.content,
            ContentType: file?.contentType || 'application/octet-stream',
            Metadata: file?.metadata,
            Tagging: tagging,
        });

        const result = await s3.send(cmd);

        return {
            key: file.key,
            etag: result.ETag,
            versionId: result.VersionId,
        };
    }

    async uploadMultipleFiles(files: UploadFileDto[]) {
        const results = await Promise.allSettled(
            files.map(async file => {
                try {
                    const result = await this.uploadFile(file);
                    return {
                        key: file.key,
                        success: true,
                        result,
                    };
                } catch (error) {
                    return {
                        key: file.key,
                        success: false,
                        error: error.message || 'Upload failed',
                    };
                }
            })
        );

        return results.map(result => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    key: 'unknown',
                    success: false,
                    error: result.reason?.message || 'Unknown error',
                };
            }
        });
    }

    async getDownloadUrlWithHead(key: string, versionId?: string, expires = 900) {
        const downloadUrl = await this.getDownloadUrl(key, versionId, expires);
        const fileInfo = await this.headObject(key, versionId);

        return {
            downloadUrl,
            fileInfo: {
                etag: fileInfo.eTag || '',
                contentLength: fileInfo.contentLength || 0,
                contentType: fileInfo.contentType || '',
                lastModified: new Date().toISOString(),
                versionId: fileInfo.versionId,
            },
        };
    }

    getDownloadUrl(key: string, versionId?: string, expires = 900) {
        const cmd = new GetObjectCommand({
            Bucket: this.configService.s3Bucket,
            Key: key,
            VersionId: versionId,
        });
        return getSignedUrl(s3, cmd, { expiresIn: expires });
    }

    async headObject(key: string, versionId?: string) {
        const res = await s3.send(
            new HeadObjectCommand({
                Bucket: this.configService.s3Bucket,
                Key: key,
                VersionId: versionId,
            })
        );
        return {
            eTag: res.ETag,
            contentLength: res.ContentLength,
            contentType: res.ContentType,
            versionId: res.VersionId,
        };
    }

    async batchHeadObjects(items: Array<{ key: string; versionId?: string }>) {
        const results = await Promise.allSettled(
            items.map(async ({ key, versionId }) => {
                try {
                    const fileInfo = await this.headObject(key, versionId);
                    return {
                        key,
                        exists: true,
                        fileInfo: {
                            etag: fileInfo.eTag || '',
                            contentLength: fileInfo.contentLength || 0,
                            contentType: fileInfo.contentType || '',
                            lastModified: new Date().toISOString(),
                            versionId: fileInfo.versionId,
                        },
                    };
                } catch (error) {
                    return {
                        key,
                        exists: false,
                        error: error.message || 'File not found',
                    };
                }
            })
        );

        return results.map(result => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    key: 'unknown',
                    exists: false,
                    error: result.reason?.message || 'Unknown error',
                };
            }
        });
    }

    async deleteObject(key: string, versionId?: string) {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: this.configService.s3Bucket,
                Key: key,
                VersionId: versionId,
            })
        );
        return { ok: true };
    }

    async deleteObjects(items: Array<{ key: string; versionId?: string }>) {
        if (items.length === 0) {
            return { deleted: [], errors: [] };
        }

        const deleteRequest = {
            Bucket: this.configService.s3Bucket,
            Delete: {
                Objects: items.map(({ key, versionId }) => ({
                    Key: key,
                    VersionId: versionId,
                })),
            },
        };

        const result = await s3.send(new DeleteObjectsCommand(deleteRequest));

        return {
            deleted:
                result.Deleted?.map(item => ({
                    key: item.Key!,
                    versionId: item.VersionId,
                })) || [],
            errors:
                result.Errors?.map(error => ({
                    key: error.Key!,
                    code: error.Code,
                    message: error.Message,
                    versionId: error.VersionId,
                })) || [],
        };
    }
}
