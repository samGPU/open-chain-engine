import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "./constants";

export default class WalletController {
    constructor() {
        this.walletConnected = false;
        this.transactionInProgress = false;
        this.provider = null;
        this.signer = null;

        this.web3Modal = new Web3Modal({
            network: "mumbai",
            cacheProvider: true,
            providerOptions: {},
        });
    }

    /**
     * this.setLoading: Set the transactionInProgress state
     */
    setLoading(bool) {
        this.transactionInProgress = bool;
    }
      
    /**
     * #setWalletConnected: Set the walletConnected state
     */
    #setWalletConnected(bool) {
        this.walletConnected = bool;
    }

    /**
     * connectWallet: Connects the MetaMask wallet
     */
    async connectWallet() {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await this.#getProviderOrSigner();
            this.#setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * #getProviderOrSigner: Get the provider or signer object representing the Ethereum RPC
     */
    async #getProviderOrSigner(needSigner = false) {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await this.web3Modal.connect();
        const web3Provider = new providers.Web3Provider(provider);
      
        // If user is not connected to the Mumbai network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 80001) {
            await this.#changeNetwork();
            // window.alert("Change the network to Mumbai");
            // throw new Error("Change network to Mumbai");
        }
      
        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    /**
     * #changeNetwork: Change the network to Mumbai testnet
     */
    async #changeNetwork() {
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
        }
    }

    /**
     * publicMint: Mint an NFT
     */
    async publicMint() {
        try {
            console.log("Public mint");
            // We need a Signer here since this is a 'write' transaction.
            const signer = await this.#getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            // call the mint from the contract to mint the LW3Punks
            const tx = await nftContract.mint({
                // value signifies the cost of one LW3Punks which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            this.setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            this.setLoading(false);
            window.alert("You successfully minted a LW3Punk!");
        } catch (err) {
            console.error(err);
        }
    };
}