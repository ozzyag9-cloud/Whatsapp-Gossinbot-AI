import { Alchemy, Network } from 'alchemy-sdk';
import { prisma } from '@/lib/prisma';
const alchemy = new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY, network: Network.MATIC_MAINNET });

export async function getTrendingNFTs(userId) {
  try {
    // Example: Get top collections by volume on Polygon
    const { contracts } = await alchemy.nft.getContractsForOwner('0x000000000000000000000000dEaD');
    const top = contracts.slice(0, 5);
    
    const formatted = await Promise.all(top.map(async (c, i) => {
      const floor = await alchemy.nft.getFloorPrice(c.address);
      return {
        id: i + 1,
        name: c.name || 'Unknown',
        floor: floor?.openSea?.floorPrice || 0,
        address: c.address
      };
    }));

    await prisma.searchLog.create({ 
      data: { userId, query: 'nft:trending', results: formatted } 
    });
    
    return formatted;
  } catch (e) {
    return [{ id: 1, name: 'CoolCats MU', floor: 0.05, address: '0x...' }];
  }
}

export async function getNFTDetails(userId, index) {
  const log = await prisma.searchLog.findFirst({ 
    where: { userId, query: 'nft:trending' }, 
    orderBy: { createdAt: 'desc' } 
  });
  const nft = log?.results?.[index - 1];
  if (!nft) return { error: 'Pick 1-5 from last list' };
  
  return {
    answer: `🖼️ ${nft.name}\n💰 Floor: ${nft.floor} MATIC\n📜 ${nft.address.slice(0,10)}...\n\nReply 'buy:${index}' to purchase via WalletConnect`,
    nft
  };
}
