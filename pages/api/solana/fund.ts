import {Connection, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeURL} from '@figment-solana/lib';

export default async function fund(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    // get 1 SOL as request Airdrop
    // solscan https://explorer.solana.com/tx/3tsvtHdbfS9aiqfh4xbzQam4GHMiL1Nn1Kjq5x4g62sDiU7WK7cQYPvnjSGSv19FogyfpheeAj1SeL7qqkmrbt24?cluster=devnet
    const {network, address} = req.body;
    const url = getNodeURL(network);
    const connection = new Connection(url, 'confirmed');
    const publicKey = new PublicKey(address);
    const hash = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    console.log(hash);
    await connection.confirmTransaction(hash);
    res.status(200).json(hash);
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
