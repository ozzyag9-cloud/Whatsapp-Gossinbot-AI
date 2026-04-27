import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeDeal(rawText, userId) {
  const schema = {
      type: "object",
          properties: {
                vendor: { type: "string" },
                      amount: { type: "number" },
                            currency: { type: "string" },
                                  items: { type: "array", items: { type: "string" } },
                                        terms: { type: "string" },
                                              deadline: { type: "string" }
                                                  }
                                                    };

                                                      const extraction = await openai.chat.completions.create({
                                                          model: "gpt-4o-mini",
                                                              response_format: { type: "json_schema", json_schema: { name: "deal", schema } },
                                                                  messages: [
                                                                        { role: "system", content: "Extract deal terms from text. Return JSON only." },
                                                                              { role: "user", content: rawText }
                                                                                  ]
                                                                                    });

                                                                                      const deal = JSON.parse(extraction.choices[0].message.content);

                                                                                        const market = await openai.chat.completions.create({
                                                                                            model: "gpt-4o-mini",
                                                                                                messages: [
                                                                                                      { role: "system", content: "You are a Mauritius procurement expert. Is this deal fair? Reply: ACCEPT, NEGOTIATE, or REJECT. Then 1-line why. Consider MUR market rates." },
                                                                                                            { role: "user", content: JSON.stringify(deal) }
                                                                                                                ]
                                                                                                                  });

                                                                                                                    const verdict = market.choices[0].message.content;
                                                                                                                      await prisma.dealLog.create({ data: { userId,...deal, verdict } });
                                                                                                                        return { deal, verdict };
                                                                                                                        }