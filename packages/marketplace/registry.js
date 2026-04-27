import { prisma } from '@/lib/prisma';

export async function installAgent(userId, agentSlug) {
  const agent = await prisma.agent.findUnique({ where: { slug: agentSlug, status: 'approved' } });
    if (!agent) return { answer: 'Agent not found. Try /marketplace' };

      if (agent.type === 'goal_template') {
          const steps = agent.config.steps;
              await prisma.goal.create({
                    data: {
                            userId,
                                    title: agent.name,
                                            steps: { create: steps.map((s, i) => ({ content: s, order: i })) }
                                                  }
                                                      });
                                                          await prisma.agent.update({ where: { id: agent.id }, data: { installs: { increment: 1 } } });
                                                              return { answer: `✅ Installed: ${agent.name}\nStep 1: ${steps[0]}\nReply '1' to execute` };
                                                                }

                                                                  if (agent.type === 'executor_tool') {
                                                                      await prisma.userTool.create({ data: { userId, agentId: agent.id } });
                                                                          return { answer: `🔧 Tool installed: ${agent.name}\nNow available in your goals` };
                                                                            }
                                                                            }

                                                                            export async function listAgents() {
                                                                              const agents = await prisma.agent.findMany({ where: { status: 'approved' } });
                                                                                return agents.map(a => `install:${a.slug} - ${a.name} ${a.price > 0? `${a.price/100}USD` : 'Free'}`).join('\n');
                                                                                }