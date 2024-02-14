import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "./constants";

// States
let walletConnected = false;
let transactionInProgress = false;

function setLoading(bool) {
  transactionInProgress = bool;
}

function setWalletConnected(bool) {
  walletConnected = bool;
}

// Web3Modal instance
const web3Modal = new Web3Modal({
  network: "mumbai",
  cacheProvider: true,
  providerOptions: {},
});

/**
 * publicMint: Mint an NFT
 */
const publicMint = async () => {
  try {
    console.log("Public mint");
    // We need a Signer here since this is a 'write' transaction.
    const signer = await getProviderOrSigner(true);
    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    // call the mint from the contract to mint the LW3Punks
    const tx = await nftContract.mint({
      // value signifies the cost of one LW3Punks which is "0.01" eth.
      // We are parsing `0.01` string to ether using the utils library from ethers.js
      value: utils.parseEther("0.01"),
    });
    setLoading(true);
    // wait for the transaction to get mined
    await tx.wait();
    setLoading(false);
    window.alert("You successfully minted a LW3Punk!");
  } catch (err) {
    console.error(err);
  }
};

/**
 * connectWallet: Connects the MetaMask wallet
 */
const connectWallet = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // When used for the first time, it prompts the user to connect their wallet
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (err) {
    console.error(err);
  }
};

async function changeNetwork() {
  try {
      await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // 0x13881 is the chainId for the Mumbai testnet
      });
  } catch (switchError) {
      if (switchError.code === 4902) {
          try {
              await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                      chainId: '0x13881',
                      chainName: 'Mumbai Testnet',
                      nativeCurrency: {
                          name: 'MATIC',
                          symbol: 'MATIC',
                          decimals: 18
                      },
                      rpcUrls: ['https://rpc-mumbai.matic.today'],
                      blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/'],
                  }],
              });
          } catch (addError) {
              // handle "add" error
              console.error('Unable to switch networks, please switch manually', addError)
          }
      }
      // handle other "switch" errors
  }
}

/**
 * Returns a Provider or Signer object representing the Ethereum RPC with or without the
 * signing capabilities of metamask attached
 *
 * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
 *
 * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
 * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
 * request signatures from the user using Signer functions.
 *
 * @param {*} needSigner - True if you need the signer, default false otherwise
 */
const getProviderOrSigner = async (needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3Modal.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to the Mumbai network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 80001) {
    await changeNetwork();
    // window.alert("Change the network to Mumbai");
    // throw new Error("Change network to Mumbai");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};


const button = document.getElementById('connectButton');

button.onclick = async () => {
  console.log('wow! you clicked me!')
  if(!walletConnected){
    await connectWallet();
  }
};