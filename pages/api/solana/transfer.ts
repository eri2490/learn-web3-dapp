import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeURL} from '@figment-solana/lib';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

export default async function transfer(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  // to transfer some value to another account, we have to create and send a signed transaction to the `cluster`
  // when a transaction is submitted to the `cluster` in the transaction,
  // the solana runtime will execute a program to process each of the instructions contained in the transaction
  // if any of the instructions fail for any reason, the entire transaction will revert

  try {
    const {address, secret, recipient, lamports, network} = req.body;
    const url = getNodeURL(network);
    const connection = new Connection(url, 'confirmed');

    const fromPubkey = new PublicKey(address);
    const toPubkey = new PublicKey(recipient);
    // The secret key is stored in our state as a stringified array
    const secretKey = Uint8Array.from(JSON.parse(secret as string));

    // supply a `sender`, a `receiver`, an `amount`
    const instructions = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    });

    // signers Array contains both the signers `publicKey` & `secretKey`
    // the `secretKey` is used to sign the transaction
    const signers = [
      {
        publicKey: fromPubkey,
        secretKey,
      },
    ];

    // create new `Transaction` object add the instructions to it
    const transaction = new Transaction().add(instructions);

    // await the confirmation of the signed transaction using `sendAndConfirmTransaction`
    const hash = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
    );

    res.status(200).json(hash);
  } catch (error) {
    console.log(error);
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
