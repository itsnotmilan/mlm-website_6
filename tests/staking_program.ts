import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

(async () => {
    const user = pg.wallet.publicKey;
    const developerPubkey = new PublicKey("81dNvZnonR77FjfS3pb8w5ah23tzCCXG3S5JbvNoS7ws");

    console.log("User Public Key:", user.toString());
    console.log("Developer Public Key:", developerPubkey.toString());

    const [stakingAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("staking"), user.toBuffer()],
        pg.program.programId
    );

    console.log("Staking Account:", stakingAccount.toString());

    // Check if the staking account exists before trying to close it
    try {
        const stakingAccountData = await pg.program.account.stakingAccount.fetch(stakingAccount);
        console.log("Staking Account exists:", stakingAccount.toString());

        // If account exists, try to close it
        console.log("Closing existing staking account...");
        const closeTx = await pg.program.methods.closeAccount()
            .accounts({
                stakingAccount,
                user,
            })
            .rpc();
        console.log("Staking Account closed. Transaction:", closeTx);
    } catch (error) {
        if (error.message.includes('Account does not exist') || error.errorCode?.code === 'AccountNotInitialized') {
            console.log("Staking Account not initialized, skipping closure.");
        } else {
            console.error("Error closing staking account:", error);
        }
    }

    // Reinitialize the account
    console.log("Initializing Staking Account...");
    try {
        const initializeTx = await pg.program.methods.initialize()
            .accounts({
                stakingAccount,
                user,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
        console.log("Staking Account Initialized:", initializeTx);
    } catch (initError) {
        console.error("Error initializing staking account:", initError);
    }

    // Stake 1 SOL
    const stakeAmount = new BN(1_000_000_000); // 1 SOL in lamports
    console.log("Staking 1 SOL...");

    try {
        const stakeTx = await pg.program.methods.stake(stakeAmount)
            .accounts({
                stakingAccount,
                user,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
        console.log("Stake successful. Transaction:", stakeTx);
    } catch (error) {
        console.error("Error during staking:", error);
    }

    // Get unclaimed rewards
    console.log("Getting unclaimed rewards...");

    try {
        const unclaimedRewardsTx = await pg.program.methods.getUnclaimedRewards()
            .accounts({
                stakingAccount,
                user,
            })
            .rpc();
        console.log("Get unclaimed rewards successful. Transaction:", unclaimedRewardsTx);

        const updatedStakingAccount = await pg.program.account.stakingAccount.fetch(stakingAccount);
        console.log("Unclaimed rewards:", updatedStakingAccount.unclaimedRewards.toString());
    } catch (error) {
        console.error("Error getting unclaimed rewards:", error);
        if (error.logs) {
            console.error("Error logs:", error.logs);
        }
        console.error("Error stack:", error.stack);
    }

    // Compound
    console.log("Compounding...");

    try {
        const compoundTx = await pg.program.methods.compound()
            .accounts({
                stakingAccount,
                user,
            })
            .rpc();
        console.log("Compound successful. Transaction:", compoundTx);
    } catch (error) {
        if (error.errorCode?.code === 'ActionTooSoon') {
            console.log("Cannot compound yet. Please wait 24 hours.");
        } else {
            console.error("Error during compounding:", error);
        }
    }

    // Claim rewards
    console.log("Claiming rewards...");

    try {
        const claimTx = await pg.program.methods.claim()
            .accounts({
                stakingAccount,
                user,
                developer: developerPubkey,
            })
            .rpc();
        console.log("Claim successful. Transaction:", claimTx);
    } catch (error) {
        if (error.errorCode?.code === 'ActionTooSoon') {
            console.log("Cannot claim rewards yet. Please wait 24 hours.");
        } else {
            console.error("Error during claiming:", error);
        }
    }

    // Final account state
    try {
        const finalStakingAccountData = await pg.program.account.stakingAccount.fetch(stakingAccount);
        console.log("Final stake amount:", finalStakingAccountData.stakeAmount.toString());
        console.log("Final TVL:", finalStakingAccountData.tvl.toString());
        console.log("Final unclaimed rewards:", finalStakingAccountData.unclaimedRewards.toString());
        console.log("Final last action time:", new Date(finalStakingAccountData.lastActionTime.toNumber() * 1000).toISOString());
    } catch (error) {
        console.error("Error fetching final staking account state:", error);
    }
})();