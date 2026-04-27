import { prisma } from '@/lib/prisma';
import { sendWhatsAppText } from '@/packages/tools/whatsapp';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany({ where: { goals: { some: { status: 'active' } } } });
    for (const user of users) {
        const step = await prisma.step.findFirst({
              where: { status: 'pending', goal: { userId: user.id } },
                    orderBy: { order: 'asc' }
                        });
                            if (!step) continue;
                                const msg = `☀️ Whatanapp Morning Brief\n🎯 Next Step: ${step.content}\nReply 1 to execute, 2 for news`;
                                    await sendWhatsAppText(user.phone, msg, process.env.WHATSAPP_TOKEN);
                                      }
                                        return NextResponse.json({ pushed: users.length });
                                        }