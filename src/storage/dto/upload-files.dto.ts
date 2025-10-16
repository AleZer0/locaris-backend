export interface UploadFileDto {
    key: string;
    content: Buffer | Uint8Array | string;
    contentType?: string | null;
    metadata?: Record<string, string>;
    tags?: Record<string, string>;
}
