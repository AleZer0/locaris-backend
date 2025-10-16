import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { SendPushDto } from './dto/push-message.dto';

type TicketRef = { id?: string; to: string };

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly expo = new Expo();

    /**
     * Envía notificaciones a muchos tokens y devuelve:
     * - tickets: respuesta inmediata del push service de Expo
     * - failedTokens: tokens con error inmediato (mensaje mal formado, token inválido, etc.)
     * - receiptIds: ids para consultar estado posterior (entrega a FCM/APNs)
     */
    async sendToMany(dto: SendPushDto) {
        const messages: ExpoPushMessage[] = dto.tokens
            .filter(t => Expo.isExpoPushToken(t))
            .map(to => ({
                to,
                title: dto.content.title,
                body: dto.content.body,
                data: { ...dto.data }, // { type, payload }
                sound: dto.content.sound ?? 'default',
                channelId: dto.content.channelId, // Android: debe existir
                priority: dto.content.priority as any,
                ttl: dto.content.ttl,
                subtitle: dto.content.subtitle,
                mutableContent: dto.content.mutableContent,
            }));

        const chunks = this.expo.chunkPushNotifications(messages);
        const tickets: ExpoPushTicket[] = [];
        const ticketRefs: TicketRef[] = [];

        for (const chunk of chunks) {
            const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);

            // Relación "ticket <-> token" para poder purgar después
            for (let i = 0; i < ticketChunk.length; i++) {
                const ticket = ticketChunk[i];
                const ticketId = ticket?.status === 'ok' && 'id' in ticket ? ticket.id : undefined;
                ticketRefs.push({
                    id: ticketId,
                    to: chunk[i].to as string,
                });
            }
        }

        // Errores inmediatos (status==='error' en ticket)
        const failedTokensImmediate = ticketRefs
            .map((ref, i) => ({ ref, ticket: tickets[i] }))
            .filter(x => x.ticket?.status === 'error')
            .map(x => ({
                to: x.ref.to,
                details: (x.ticket as any)?.details,
                message: (x.ticket as any)?.message,
            }));

        const receiptIds = tickets
            .filter(
                (ticket): ticket is ExpoPushTicket & { id: string } =>
                    ticket?.status === 'ok' && 'id' in ticket && typeof ticket.id === 'string'
            )
            .map(t => t.id);

        return { tickets, receiptIds, ticketRefs, failedTokensImmediate };
    }

    /**
     * Consulta receipts (después de algunos segundos) y devuelve tokens a purgar
     * cuando hay DeviceNotRegistered u otros errores terminales.
     */
    async fetchReceiptsAndFindInvalidTokens(ticketRefs: TicketRef[]) {
        const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(
            ticketRefs.map(r => r.id).filter((x): x is string => !!x)
        );

        const tokensToPurge = new Set<string>();
        const receiptsRaw: Record<string, ExpoPushReceipt> = {};

        for (const chunk of receiptIdChunks) {
            const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
            Object.assign(receiptsRaw, receipts);

            for (const id of Object.keys(receipts)) {
                const receipt = receipts[id];
                if (receipt.status === 'error') {
                    const ref = ticketRefs.find(r => r.id === id);
                    if (receipt.details && (receipt.details as any).error === 'DeviceNotRegistered' && ref) {
                        tokensToPurge.add(ref.to);
                    }
                    this.logger.warn(`Push receipt error id=${id} -> ${JSON.stringify(receipt)}`);
                }
            }
        }

        return { receipts: receiptsRaw, invalidTokens: [...tokensToPurge] };
    }
}
