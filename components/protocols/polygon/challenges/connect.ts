import {ethers} from 'ethers';

declare let window: {
  ethereum: ethers.providers.ExternalProvider;
};

const connect = async () => {
  try {
    // Define the provider by calling `web3Provider` method of `providers`
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (provider) {
      // ensure that Metamask connects to the page
      // and that we can query the currently selected account in Metamask.
      // this is done by using `send` on the provider, to send the `eth_requestAccounts`
      await provider.send('eth_requestAccounts', []);
      // bring up  a Metamask dialog, asking the user to unlock their Metamask if it is locked,
      // or to connect an account to the page if Metamask is unlocked
      const signer = provider.getSigner();
      // now signer represents the current connected account.
      // `getAddress` method will do the job of querying the address of the current connected account
      const address = await signer.getAddress();
      return {
        address,
      };
    } else {
      return {
        error: 'Please install Metamask at https://metamask.io',
      };
    }
  } catch (error) {
    return {
      error: 'An unexpected error occurs',
    };
  }
};

export default connect;
