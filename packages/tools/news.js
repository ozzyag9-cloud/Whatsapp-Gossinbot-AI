import Parser from 'rss-parser';
const parser = new Parser();

const SOURCES = [
  { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/businessNews', bias: 'center' },
    { name: 'AP News', url: 'https://feeds.apnews.com/apnews/business', bias: 'center' },
      { name: 'Le Mauricien', url: 'https://www.lemauricien.com/feed/', bias: 'mu' },
        { name: "L'Express", url: 'https://www.lexpress.mu/rss.xml', bias: 'mu' },
          { name: 'Police MU', url: 'https://police.govmu.org/police/?feed=rss2', bias: 'gov' },
          ];

          export async function getDailyBrief(topics = ['business', 'mauritius']) {
            let articles = [];
              for (const source of SOURCES) {
                  try {
                        const feed = await parser.parseURL(source.url);
                              articles.push(...feed.items.slice(0, 2).map(i => ({
                                      title: i.title,
                                              link: i.link,
                                                      source: source.name,
                                                              bias: source.bias
                                                                    })));
                                                                        } catch (e) { console.log('Feed error:', source.name); }
                                                                          }
                                                                            return articles.slice(0, 5);
                                                                            }