// notifications/dto/push-message.dto.ts
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export type NotificationType = 'vehicle-shipment.created' | 'entry.created' | 'departure.created' | string;

export class TargetTokensDto {
    @IsArray()
    @IsString({ each: true })
    tokens!: string[]; // Expo push tokens: ExponentPushToken[xxxxxxxx]
}

export class NotificationDataDto {
    // Carga útil genérica que recibirá tu app (deep links, ids, etc.)
    @IsString() type!: NotificationType;
    @IsObject()
    @IsOptional()
    payload?: Record<string, any>;
}

export class NotificationContentDto {
    @IsString()
    @MaxLength(64)
    title!: string;

    @IsString()
    @MaxLength(200)
    body!: string;

    // Android: el canal debe existir en el cliente
    @IsString()
    @IsOptional()
    channelId?: string; // p.ej. "general"

    // Opcionales compatibles con Expo Push
    @IsString()
    @IsOptional()
    sound?: 'default' | string | null;

    @IsString()
    @IsOptional()
    priority?: 'default' | 'normal' | 'high';

    @IsInt()
    @Min(0)
    @IsOptional()
    ttl?: number;

    @IsBoolean()
    @IsOptional()
    mutableContent?: boolean;

    @IsString()
    @IsOptional()
    subtitle?: string; // iOS
}

export class SendPushDto {
    tokens!: string[];
    data!: NotificationDataDto;
    content!: NotificationContentDto;
}
