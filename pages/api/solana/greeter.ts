import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeURL} from '@figment-solana/lib';
import * as borsh from 'borsh';

// The state of a greeting account managed by the hello world program
class GreetingAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

// Borsh schema definition for greeting accounts
const GreetingSchema = new Map([
  [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);

// The expected size of each greeting account.
const GREETING_SIZE = borsh.serialize(
  GreetingSchema,
  new GreetingAccount(),
).length;

type ResponseT = {
  hash: string;
  greeter: string;
};

// the result of the number of times it has been greeted
// https://explorer.solana.com/tx/33JmyqgPh7JGUQ2uYN2J5CYXZ6HUPVfcV29hJBG2aMUZkVp6oXkALnNCzJ6T6w4CSEpLgCXtXZbE8cShwZS1nT8X?cluster=devnet
export default async function greeter(
  req: NextApiRequest,
  res: NextApiResponse<string | ResponseT>,
) {
  try {
    const {network, secret, programId: programAddress} = req.body;
    const url = getNodeURL(network);
    const connection = new Connection(url, 'confirmed');

    const programId = new PublicKey(programAddress);
    // payer is an account
    const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secret)));
    const GREETING_SEED = 'hello';

    // create a publicKey from a seed
    const greetedPubkey = await PublicKey.createWithSeed(
      payer.publicKey,
      GREETING_SEED,
      programId,
    );

    // This function calculates the fees we have to pay to keep the newly
    // created account alive on the blockchain. We're naming it lamports because
    // that is the denomination of the amount being returned by the function.
    const lamports = await connection.getMinimumBalanceForRentExemption(
      GREETING_SIZE,
    );

    // create a account from a seed
    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        basePubkey: payer.publicKey,
        fromPubkey: payer.publicKey,
        lamports,
        newAccountPubkey: greetedPubkey,
        programId,
        seed: GREETING_SEED,
        space: GREETING_SIZE,
      }),
    );

    // Complete this function call with the expected arguments.
    const hash = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);
    res.status(200).json({
      hash: hash,
      greeter: greetedPubkey.toBase58(),
    });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
