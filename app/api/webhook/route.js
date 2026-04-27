import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { brain } from '@/packages/core/brain';
import { transcribeWhatsAppAudio, generateTTS } from '@/packages/tools/voice';
import { updatePinDashboard } from '@/packages/ui/pin-manager';
import { sendWhatsAppText, sendWhatsAppAudio, sendQuickReplies } from '@/packages/tools/whatsapp';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
    if (searchParams.get('hub.verify_token') === VERIFY_TOKEN) {
        return new Response(searchParams.get('hub.challenge'));
          }
            return new Response('Forbidden', { status: 403 });
            }

            export async function POST(req) {
              const body = await req.json();
                const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
                  if (!message) return NextResponse.json({});

                    const userId = message.from;
                      await prisma.user.upsert({ where: { phone: userId }, update: {}, create: { phone: userId } });

                        let userText = '';
                          if (message.text?.body) userText = message.text.body;
                            if (message.audio?.id) userText = await transcribeWhatsAppAudio(message.audio.id, WHATSAPP_TOKEN);
                              if (message.button?.payload) userText = message.button.payload;
                                if (message.interactive?.button_reply?.id) userText = message.interactive.button_reply.id;

                                  const result = await brain.think(userText, userId, message);

                                    const user = await prisma.user.findUnique({ where: { phone: userId } });
                                      if (result.voice && user?.voiceEnabled) {
                                          const audioBuffer = await generateTTS(result.answer);
                                              await sendWhatsAppAudio(userId, audioBuffer, WHATSAPP_TOKEN);
                                                } else {
                                                    await sendWhatsAppText(userId, result.answer, WHATSAPP_TOKEN);
                                                      }

                                                        if (result.chips?.length) {
                                                            await sendQuickReplies(userId, result.chips, WHATSAPP_TOKEN);
                                                              }

                                                                await updatePinDashboard(userId, WHATSAPP_TOKEN);
                                                                  return NextResponse.json({ status: 'ok' });
                                                                  }