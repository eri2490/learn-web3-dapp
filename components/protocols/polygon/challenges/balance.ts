import {ethers} from 'ethers';

declare let window: {
  ethereum: ethers.providers.ExternalProvider;
};

const getBalance = async (address: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Todo: show the wallet balance
    /* Promise returns a BigNumber, which is a specific data type for handling numbers
      which fall outside the range of safe values in JS
    */
    const balance = await provider.getBalance(address);
    if (!balance) {
      throw new Error('Please complete the code');
    }
    return {
      /* to easy manipulate the returned type we convert it to string using `toString()` */
      balance: balance.toString(),
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export default getBalance;
