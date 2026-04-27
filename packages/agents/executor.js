import { prisma } from '@/lib/prisma';

export async function runNextStep(userId) {
  const step = await prisma.step.findFirst({
      where: { status: 'pending', goal: { userId, status: 'active' } },
          orderBy: { order: 'asc' },
            });
              if (!step) return null;

                // Add real API calls here later: Resend, Notion, etc
                  console.log('Executing:', step.content);

                    await prisma.step.update({ where: { id: step.id }, data: { status: 'done' } });
                      return step;
                      }