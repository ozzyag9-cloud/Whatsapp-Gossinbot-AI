export default async function handler(req, res) {
  // Webhook verification for Meta
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

  // Handle incoming messages
  if (req.method === 'POST') {
    console.log("Webhook received:", JSON.stringify(req.body));
    return res.status(200).send('EVENT_RECEIVED');
  }
  
  return res.status(405).send('Method Not Allowed');
}
