import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "./constants";

export default class WalletController {
    constructor() {
        this.walletConnected = false;
        this.transactionInProgress = false;

        this.web3Modal = new Web3Modal({
            network: "blast sepolia",
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
        let provider = await this.web3Modal.connect();
        const web3Provider = new providers.Web3Provider(provider);
      
        // If user is not connected to the Mumbai network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();

        // console.log(chainId)
        if (chainId !== 168587773) {
            // await this.#changeNetwork();
            // window.alert("Change the network to Mumbai");
            // throw new Error("Change network to Mumbai");
            console.warn('Connect to Blast Sepolia!')
        }
      
        if (needSigner) {
            let signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    /**
     * #changeNetwork: Change the network to Blast Sepolia
     * Not using for now as broken
     */
    async #changeNetwork() {
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xA066FD7' }], // 0xA066FD7 is the hexadecimal equivalent of 168587773
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '168587773',
                            chainName: 'Blast Sepolia',
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://sepolia.blast.io'],
                            blockExplorerUrls: ['https://testnet.blastscan.io'],
                        }],
                    });
                } catch (addError) {
                    // handle "add" error
                    console.error('Unable to switch networks, please switch manually', addError)
                }
            }
        }
    }

    async getTokenBalance(tokenAddress) {
        let signer = await this.#getProviderOrSigner(true);
        let provider = await this.#getProviderOrSigner();
        const address = await signer.getAddress();

        // Create a new contract instance with the token's contract address and the ERC20 ABI
        const tokenContract = new Contract('0x6e9fc4184BcB05A01ADc288d795597B6e9685975', [
            // Some details about the token
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ], provider);

        // Get the token balance
        const balance = await tokenContract.balanceOf(address);

        // Get the number of decimals the token uses
        const decimals = await tokenContract.decimals();

        // Convert the balance to a decimal number, taking into account the token's decimals
        const formattedBalance = balance / Math.pow(10, decimals);

        return formattedBalance;
    }

    /**
     * Call the function claimTokens in the smart contract
     */
    async convertScoreToToken(score) {
        try {
            // We need a Signer here since this is a 'write' transaction.
            let signer = await this.#getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            // call the claimTokens from the contract to convert the score to tokens
            const tx = await nftContract.claimTokens(score);
            this.setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            this.setLoading(false);
            return true
        } catch (err) {
            console.error(err);
            return false
        }
    }
}