import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeWhatsAppAudio(mediaId, token) {
  const media = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

          const audioBuffer = await fetch(media.url, {
              headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.arrayBuffer());

                  const transcription = await openai.audio.transcriptions.create({
                      file: new File([audioBuffer], "audio.ogg", { type: "audio/ogg" }),
                          model: "whisper-1",
                            });
                              return transcription.text;
                              }

                              export async function generateTTS(text) {
                                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0,200))}&tl=en&client=tw-ob`;
                                  const res = await fetch(url);
                                    return await res.arrayBuffer();
                                    }