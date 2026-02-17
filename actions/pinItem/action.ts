'use server';

import { prisma } from '@/lib/db';
import { PinType } from '@/lib/generated/prisma/enums';

type PinInput = {
    externalId: string;
    type?: PinType;
    title?: string | null;
    imageUrl?: string | null;
    value?: string | null;
};

export async function togglePinAction(userId: string, input: PinInput) {

    if (!userId) {
        return { success: false, error: 'Unauthorized', code: 401 };
    }

    const { externalId, type = PinType.POLYMARKET, title, imageUrl, value } = input;

    try {
        const existing = await prisma.pinnedItem.findFirst({
            where: {
                userId,
                type,
                externalId,
            },
        });

        if (existing) {
            await prisma.pinnedItem.delete({ where: { id: existing.id } });
            return { success: true, action: 'unpinned', externalId };
        }

        await prisma.pinnedItem.create({
            data: {
                userId,
                type,
                externalId,
                title: title ?? null,
                imageUrl: imageUrl ?? null,
                value: value ?? null,
                order: 0,
            },
        });

        return { success: true, action: 'pinned', externalId };
    } catch (err) {
        console.error('Toggle pin error:', err);
        return { success: false, error: 'Database error', code: 500 };
    }
}
export async function readUserPinnedItems(userId: string) {
    if (!userId) {
        console.warn('No userId provided for pinned items');
        return [];
    }

    try {
        const items = await prisma.pinnedItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return items;
    } catch (err) {
        console.error('Error reading pinned items:', err);
        return [];
    }
}