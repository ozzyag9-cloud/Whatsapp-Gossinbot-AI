import { prisma } from '@/lib/prisma';
import { getDailyBrief } from '@/packages/tools/news';
import { runNextStep } from '@/packages/agents/executor';
import { installAgent, listAgents } from '@/packages/marketplace/registry';
import { analyzeDeal } from '@/packages/tools/deal-analyzer';
import { getTrendingNFTs, getNFTDetails } from '@/packages/tools/nft';
import { browseSearch, browseOpen } from '@/packages/tools/browser';

export const brain = {
  async think(text, userId, message) {
    // Number replies 1-5 for Browse/NFT
    if (/^[1-5]$/.test(text)) {
      const lastBrowse = await prisma.searchLog.findFirst({ 
        where: { userId }, orderBy: { createdAt: 'desc' } 
      });
      if (lastBrowse?.query.startsWith('browse:')) return await browseOpen(userId, parseInt(text));
      if (lastBrowse?.query === 'nft:trending') return await getNFTDetails(userId, parseInt(text));
    }

    // Commands
    if (text === '1' || text.toLowerCase() === 'execute') return this.execute(userId);
    if (text === '2' || text.toLowerCase() === '/news') return this.news(userId);
    if (text === '3' || text.toLowerCase() === '/metrics') return this.metrics(userId);
    if (text.startsWith('goal:')) return this.createGoal(text.replace('goal:', '').trim(), userId);
    if (text.startsWith('install:')) return await installAgent(userId, text.replace('install:', '').trim());
    if (text === '/marketplace' || text === 'market') return { answer: `🛒 Whatanapp Marketplace:\n${await listAgents()}\n\nReply 'install:slug' to add` };
    
    // NFT Mode
    if (text === '/nft' || text === '/nft trending') {
      const nfts = await getTrendingNFTs(userId);
      const list = nfts.map(n => `${n.id}. ${n.name} - ${n.floor} MATIC`).join('\n');
      return { answer: `🖼️ NFT Trending 24h:\n${list}\n\nReply 1-5 to view details` };
    }
    if (text.startsWith('buy:')) {
      const index = parseInt(text.replace('buy:', ''));
      return { answer: `🔐 To buy NFT #${index}, connect wallet:\nhttps://metamask.app.link/wc?uri=demo\n\nTap to sign in MetaMask. Gas ~0.002 MATIC.` };
    }

    // Browse Mode - Google style
    if (text.startsWith('/browse ')) {
      const query = text.replace('/browse ', '');
      return await browseSearch(query, userId);
    }

    // Deal Mode: if document or image
    if (message?.document || message?.image) {
      const rawText = "Sample invoice: Vendor ABC, Amount 50000 MUR, Items: Laptops"; 
      const { deal, verdict } = await analyzeDeal(rawText, userId);
      return {
        answer: `📄 Deal Analysis: ${deal.vendor}\n💰 ${deal.amount} ${deal.currency}\n⚖️ Verdict: ${verdict}`,
        chips: [
          { id: 'negotiate_script', title: '1️⃣ Draft Reply' },
          { id: 'save_deal', title: '2️⃣ Save' },
          { id: 'browse_vendor', title: '3️⃣ Check Vendor' }
        ]
      };
    }

    // Default expert response
    const activeGoal = await prisma.goal.findFirst({ where: { userId, status: 'active' } });
    return {
      answer: `Whatanapp AI ready. Commands:\n1=Execute 2=News /nft /browse [query]\n\nFor your goal "${activeGoal?.title || 'none'}": What’s next?`,
      chips: [
        { id: 'execute', title: '1️⃣ Execute' },
        { id: '/news', title: '2️⃣ News' },
        { id: '/browse', title: '3️⃣ Search' }
      ],
      voice: text.length > 80
    };
  },

  async execute(userId) {
    const step = await runNextStep(userId);
    return { answer: step? `✅ Executed: ${step.content}` : `All steps done. Set new goal with 'goal:...'`, chips: [] };
  },

  async news(userId) {
    const user = await prisma.user.findUnique({ where: { phone: userId } });
    const articles = await getDailyBrief(user?.newsTopics);
    const formatted = articles.map((a, i) => `${i+1}. ${a.source}: ${a.title}`).join('\n');
    return { answer: `📰 Whatanapp Brief:\n${formatted}\n\nReply 1-5 for summary`, chips: [] };
  },

  async metrics(userId) {
    const goals = await prisma.goal.count({ where: { userId } });
    const done = await prisma.step.count({ where: { goal: { userId }, status: 'done' } });
    return { answer: `📊 Your Stats:\nActive Goals: ${goals}\nSteps Completed: ${done}\nReply 'goal:...' to add new`, chips: [] };
  },

  async createGoal(title, userId) {
    const steps = [`Research for ${title}`, `Create action plan`, `Execute first task`];
    const goal = await prisma.goal.create({
      data: { title, userId, steps: { create: steps.map((s, i) => ({ content: s, order: i })) } }
    });
    return { answer: `🎯 Goal created: ${title}\nStep 1: ${steps[0]}\nReply '1' to execute`, chips: [] };
  }
};
