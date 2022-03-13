import {ethers} from 'ethers';

declare let window: {
  ethereum: ethers.providers.ExternalProvider;
};

/** Transaction parameters
 * send_account: address of the token sender
 * to_address: address of the token receiver
 * send_token_amount: the amount of tokens to send
 * gas_limit: gas limit
 * gas_price: gas price
 */

// TODO: Transfer some MATIC to eat Pizza
// A random test's address
const RECIPIENT = '0xb11D554F2139d843F5c94a3185d17C4d5762a7c7';
// 0.1 MATIC
const AMOUNT = '0.01';

const transfer = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const send_account = provider.getSigner().getAddress();

    const currentGasPrice = await provider.getGasPrice();
    const gas_price = ethers.utils.hexlify(
      parseInt(currentGasPrice.toString()),
    );

    const transaction = {
      from: send_account,
      to: RECIPIENT,
      value: ethers.utils.parseEther(AMOUNT),
      nonce: provider.getTransactionCount(send_account, 'latest'),
      gasLimit: ethers.utils.hexlify(100000),
      gasPrice: gas_price,
    };

    /** Signers
     * a Signer in ethers is an abstraction of an Ethereum Account,
     * which can be used to sign messages and transactions and send signed transactions to the Ethereum Network
     */
    const hash = await provider.getSigner().sendTransaction(transaction);
    const receipt = await hash.wait();
    return {hash: receipt.transactionHash};
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export default transfer;
