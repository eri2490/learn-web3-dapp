import {ethers} from 'ethers';

declare let window: {
  ethereum: ethers.providers.ExternalProvider;
};

const query = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    /* `networkName` await `provider.getNetwork()` */
    const networkName = await provider.getNetwork().then((res) => {
      return res.name;
    });

    // TODO: create a way to query information from the blockchain and then display it on the UI
    /* we can get `chainId` as a property of `provider.network` */
    const {chainId} = await provider.getNetwork();
    /* `blockHeight` can be taken directly from the returned values of `getBlockNumber` */
    const blockHeight = await provider.getBlockNumber();
    /* `gasPriceAsGwei` get the current gas price and then formats the value into a human-friendly 
      number with the ethers utility function `formatUnits`
    */
    const gasPriceAsGwei = await provider.getGasPrice().then((res) => {
      return ethers.utils.formatUnits(res);
    });
    /* `blockInfo` must be a BlockWithTransactions type, 
      which is what function `getBlockWithTransactions` */
    const blockInfo = await provider.getBlockWithTransactions(blockHeight);
    if (!chainId || !blockHeight || !gasPriceAsGwei || !blockInfo) {
      throw new Error('Please complete the code');
    }

    return {
      data: {
        networkName,
        chainId,
        blockHeight,
        gasPriceAsGwei,
        blockInfo,
      },
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export default query;
