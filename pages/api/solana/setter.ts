import {
  Connection,
  PublicKey,
  Keypair,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeURL} from '@figment-solana/lib';

export default async function setter(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    // send data to the program, transaction
    // one of the result is https://explorer.solana.com/tx/3noB6DWfDFTYgCNCjoMoHZN85bkg9uymiHdpeJoqtvaPeDkJU9NoKvzjmk9Xrr2finC4cBfPYpGwvSkj4MaYYcrP?cluster=devnet
    const {greeter, secret, programId, network} = req.body;
    const url = getNodeURL(network);
    const connection = new Connection(url, 'confirmed');

    const greeterPublicKey = new PublicKey(greeter);
    const programKey = new PublicKey(programId);

    const payerSecretKey = new Uint8Array(JSON.parse(secret));
    const payerKeypair = Keypair.fromSecretKey(payerSecretKey);

    // create a transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          isSigner: false,
          isWritable: true,
          pubkey: greeterPublicKey,
        },
      ],
      programId: programKey,
      data: Buffer.alloc(0),
    });

    // send and confirm transaction
    const hash = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(instruction),
      [payerKeypair],
    );

    console.log(hash);

    res.status(200).json(hash);
  } catch (error) {
    console.error(error);
    res.status(500).json('Get balance failed');
  }
}
