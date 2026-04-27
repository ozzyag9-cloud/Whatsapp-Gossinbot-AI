import { prisma } from '@/lib/prisma';
import { sendWhatsAppText } from '@/packages/tools/whatsapp';
import { getDailyBrief } from '@/packages/tools/news';

export async function updatePinDashboard(userId, token) {
  const user = await prisma.user.findUnique({ where: { phone: userId }, include: { goals: { include: { steps: true } } } });
    const goal = user?.goals.find(g => g.status === 'active');
      const step = goal?.steps.find(s => s.status === 'pending');
        const news = await getDailyBrief(user?.newsTopics);

          const text = `📍 Whatanapp OS | ${new Date().toLocaleDateString('en-GB')}
          🎯 Goal: ${goal?.title || 'None'} | Step ${step? step.order + 1 : 0}/${goal?.steps.length || 0}
          ⚡ Reply: 1=Execute 2=News 3=Metrics
          📰 ${news[0]?.source}: ${news[0]?.title?.slice(0, 50)}...`;

            await sendWhatsAppText(userId, text, token);
            }