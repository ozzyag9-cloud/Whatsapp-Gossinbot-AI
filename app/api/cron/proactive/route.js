import { prisma } from '@/lib/prisma';
import { updatePinDashboard } from '@/packages/ui/pin-manager';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany();
    for (const user of users) {
        await updatePinDashboard(user.phone, process.env.WHATSAPP_TOKEN);
          }
            return NextResponse.json({ updated: users.length });
            }