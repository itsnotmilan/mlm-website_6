use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction, program::invoke};

declare_id!("8TXgmVamHo5p81jLQ4bUm6n9nx4nXoRzbDNm36j9pGR6");

#[program]
mod sol_miner {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let staking_account = &mut ctx.accounts.staking_account;
        staking_account.user = ctx.accounts.user.key();
        staking_account.stake_amount = 0;
        staking_account.last_action_time = 0;
        staking_account.tvl = 0;
        staking_account.unclaimed_rewards = 0;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let clock = Clock::get().unwrap();
        let ix = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.staking_account.key(),
            amount,
        );
        invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.staking_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let staking_account = &mut ctx.accounts.staking_account;
        staking_account.stake_amount += amount;
        staking_account.tvl += amount;
        staking_account.last_action_time = clock.unix_timestamp;

        Ok(())
    }

    pub fn compound(ctx: Context<Compound>) -> Result<()> {
        let clock = Clock::get().unwrap();
        let staking_account = &mut ctx.accounts.staking_account;

        require!(
            clock.unix_timestamp - staking_account.last_action_time >= 86400,
            ErrorCode::ActionTooSoon
        );

        let reward = calculate_reward(staking_account);
        staking_account.stake_amount += reward;
        staking_account.tvl += reward;
        staking_account.unclaimed_rewards = 0;
        staking_account.last_action_time = clock.unix_timestamp;

        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let clock = Clock::get().unwrap();
        
        let reward = {
            let staking_account = &ctx.accounts.staking_account;
            require!(
                clock.unix_timestamp - staking_account.last_action_time >= 86400,
                ErrorCode::ActionTooSoon
            );
            calculate_reward(staking_account)
        };

        let developer_fee = reward * 3 / 100;
        let claim_amount = reward - developer_fee;

        **ctx.accounts.user.try_borrow_mut_lamports()? += claim_amount;
        **ctx.accounts.developer.try_borrow_mut_lamports()? += developer_fee;
        **ctx.accounts.staking_account.to_account_info().try_borrow_mut_lamports()? -= reward;

        let staking_account = &mut ctx.accounts.staking_account;
        staking_account.tvl -= reward;
        staking_account.unclaimed_rewards = 0;
        staking_account.last_action_time = clock.unix_timestamp;

        Ok(())
    }

    pub fn get_unclaimed_rewards(ctx: Context<GetUnclaimedRewards>) -> Result<()> {
        let staking_account = &mut ctx.accounts.staking_account;
        let reward = calculate_reward(staking_account);
        staking_account.unclaimed_rewards = reward;
        Ok(())
    }

    pub fn close_account(ctx: Context<CloseAccount>) -> Result<()> {
        let staking_account = &mut ctx.accounts.staking_account;
        let user = &mut ctx.accounts.user;

        **user.to_account_info().try_borrow_mut_lamports()? += **staking_account.to_account_info().lamports.borrow();
        **staking_account.to_account_info().lamports.borrow_mut() = 0;
        staking_account.close(ctx.accounts.user.to_account_info())?;

        Ok(())
    }
}

fn calculate_reward(staking_account: &StakingAccount) -> u64 {
    let tvl_sol = staking_account.tvl as f64 / 1_000_000_000.0;
    let max_rate = 0.08; 
    let rate = max_rate / (1.0 + (tvl_sol / 1000.0).ln());
    let daily_rate = rate.max(0.01); 

    let time_since_last_action = Clock::get().unwrap().unix_timestamp - staking_account.last_action_time;
    let days_since_last_action = time_since_last_action as f64 / 86400.0;

    (staking_account.stake_amount as f64 * daily_rate * days_since_last_action) as u64
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8,
        seeds = [b"staking", user.key().as_ref()],
        bump
    )]
    pub staking_account: Account<'info, StakingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = [b"staking", user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub staking_account: Account<'info, StakingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Compound<'info> {
    #[account(
        mut,
        seeds = [b"staking", user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub staking_account: Account<'info, StakingAccount>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"staking", user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub staking_account: Account<'info, StakingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub developer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct GetUnclaimedRewards<'info> {
    #[account(
        mut,
        seeds = [b"staking", user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub staking_account: Account<'info, StakingAccount>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseAccount<'info> {
    #[account(
        mut,
        seeds = [b"staking", user.key().as_ref()],
        bump,
        close = user
    )]
    pub staking_account: Account<'info, StakingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct StakingAccount {
    pub user: Pubkey,
    pub stake_amount: u64,
    pub last_action_time: i64,
    pub tvl: u64,
    pub unclaimed_rewards: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    #[msg("Invalid withdrawal amount")]
    InvalidAmount,
    #[msg("Action can only be performed once per day")]
    ActionTooSoon,
}