import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function browseSearch(query, userId) {
  // Use Serper API - 2500 free searches
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5 })
  }).then(r => r.json());

  const results = res.organic?.slice(0, 5).map((r, i) => ({
    id: i + 1,
    title: r.title,
    link: r.link,
    snippet: r.snippet,
    source: new URL(r.link).hostname
  })) || [];

  await prisma.searchLog.create({ 
    data: { userId, query: `browse:${query}`, results } 
  });

  const list = results.map(r => `${r.id}. ${r.source}: ${r.title.slice(0,60)}...`).join('\n');
  return {
    answer: `🔍 Top 5 results for "${query}":\n${list}\n\nReply 1-5 to read AI summary`,
    results
  };
}

export async function browseOpen(userId, index) {
  const log = await prisma.searchLog.findFirst({ 
    where: { userId, query: { startsWith: 'browse:' } }, 
    orderBy: { createdAt: 'desc' } 
  });
  const result = log?.results?.[index - 1];
  if (!result) return { answer: 'Pick 1-5 from last search' };

  // Scrape + summarize
  const page = await fetch(result.link).then(r => r.text()).catch(() => result.snippet);
  const summary = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Summarize webpage for WhatsApp. 5 bullets max. No links. Be factual." },
      { role: "user", content: `URL: ${result.link}\nContent: ${page.slice(0,8000)}` }
    ]
  });

  return { 
    answer: `📄 ${result.title}\nSource: ${result.source}\n\n${summary.choices[0].message.content}\n\nReply 'more' for details, 'save' to Deal Mode` 
  };
}
