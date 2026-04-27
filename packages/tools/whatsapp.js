const API = 'https://graph.facebook.com/v20.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

export async function sendWhatsAppText(to, text, token) {
  await fetch(`${API}/${PHONE_ID}/messages`, {
      method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ messaging_product: 'whatsapp', to, text: { body: text } })
                });
                }

                export async function sendQuickReplies(to, chips, token) {
                  await fetch(`${API}/${PHONE_ID}/messages`, {
                      method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                    messaging_product: 'whatsapp', to, type: 'interactive',
                                          interactive: {
                                                  type: 'button',
                                                          body: { text: 'Choose an action:' },
                                                                  action: { buttons: chips.slice(0,3).map(c => ({ type: 'reply', reply: { id: c.id, title: c.title.slice(0,20) } })) }
                                                                        }
                                                                            })
                                                                              });
                                                                              }

                                                                              export async function sendWhatsAppAudio(to, audioBuffer, token) {
                                                                                const form = new FormData();
                                                                                  form.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'voice.ogg');
                                                                                    form.append('messaging_product', 'whatsapp');
                                                                                      const { id } = await fetch(`${API}/${PHONE_ID}/media`, {
                                                                                          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: form
                                                                                            }).then(r => r.json());

                                                                                              await fetch(`${API}/${PHONE_ID}/messages`, {
                                                                                                  method: 'POST',
                                                                                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                                                                          body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'audio', audio: { id } })
                                                                                                            });
                                                                                                            }

                                                                                                            export async function deleteWhatsAppMessage(to, messageId, token) {
                                                                                                              await fetch(`${API}/${PHONE_ID}/messages`, {
                                                                                                                  method: 'DELETE',
                                                                                                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                                                                                          body: JSON.stringify({ messaging_product: 'whatsapp', message_id: messageId })
                                                                                                                            });
                                                                                                                            }