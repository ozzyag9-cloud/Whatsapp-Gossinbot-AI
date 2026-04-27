import { brain } from "../../packages/core/brain.js";

export default async function handler(req, res) {
  // GET for Meta webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log("Webhook verified");
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // POST for incoming WhatsApp messages
  if (req.method === 'POST') {
    const body = req.body;
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const msg = entry?.messages?.[0];
    
    if (msg && msg.from) {
      const from = msg.from;
      const text = msg.text?.body || msg.interactive?.button_reply?.id || '';
      console.log(`Message from ${from}: ${text}`);
      await brain({ from, text });
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
  
  return res.status(405).send('Method Not Allowed');
}
