import { Connection, PublicKey } from "@solana/web3.js";
import axios from 'axios';
import { programs } from '@metaplex/js';
const { } = programs;
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";


const STAKE_PROGRAM_ID = new PublicKey('Stake11111111111111111111111111111111111111');
const SOLANA_MAINNET = import.meta.env.VITE_RPC_ENDPOINT;
const SOLANA_USD_API = import.meta.env.VITE_SOLANA_USD_API;

if (!SOLANA_MAINNET) {
    throw new Error("SOLANA_MAINNET environment variable is not defined");
}



const connection = new Connection(SOLANA_MAINNET);

export async function getSolBalance(address: PublicKey, _conn: Connection) {
    const balance = await connection.getBalance(address);
    return balance / 1e9;
}

export async function getSolPriceInUSD() {
    if (!SOLANA_USD_API) {
        throw new Error("VITE_SOLANA_USD_API environment variable is not defined");
    }
    try {
        const response = await axios.get(SOLANA_USD_API);
        return response.data.solana.usd;
    } catch (error) {
        console.error('Error fetching SOL price:', error);
        throw error;
    }
}

export async function getTokenAccounts(walletAddress: PublicKey, _conn: Connection) {
    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(walletAddress, { programId: TOKEN_PROGRAM_ID });
        return tokenAccounts.value.map(({ pubkey, account }) => ({
            address: pubkey.toBase58(),
            balance: account.lamports / 1e9 // Convert lamports to SOL
        }));
    } catch (error) {
        console.error('Error fetching token accounts:', error);
        throw error;
    }
}

export async function getStakeAccounts(walletAddress: PublicKey, _conn: Connection) {
    try {
        const stakeAccounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
            filters: [
                { dataSize: 200 }, // Filter by stake account data size
                { memcmp: { offset: 0, bytes: walletAddress.toBase58() } } // Filter by owner
            ]
        });
        return stakeAccounts.map(account => ({
            address: account.pubkey.toBase58(),
            balance: account.account.lamports / 1e9 // Convert lamports to SOL
        }));
    } catch (error) {
        console.error('Error fetching stake accounts:', error);
        throw error;
    }
}