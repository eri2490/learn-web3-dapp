// use is like as import as React
// Borsh stands for Binary Object Representation Serialize hor Hashing
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    // a function to return the `AccountInfo`
    account_info::{next_account_info, AccountInfo},
    // relates to entrypoint::ProgramResult
    entrypoint,
    entrypoint::ProgramResult,
    // for low-impact logging on the blockchain
    msg,
    // allows on-chain programs to implement program-specific error types
    // and see them returned by the Solana runtime
    program_error::ProgramError,
    pubkey::Pubkey,
};

// use `derive` to generate all the necessary boilerplate code
// to wrap `GreetingAccount` struct
// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    // for debugging.
    // use `msg!()`, rather than use `println!()`
    msg!("Hello World Rust program entrypoint");

    // Iterating accounts is safer than indexing
    // `mut` means mutable
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    // `?` is a shortcut expression in Rust for error propagation
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    // `GreetingAccount` has only one field, `counter`.
    // to modify it, we need to `borrow` the reference to `account.data` with the `&(borrow operator)`
    // `try_from_slice()` from `BorshDeserialize` will mutably reference and deserialize the `account.data`
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += 1;
    // `serialize()` from `BorshSerialize`, the new `counter` value is sent back to Solana in the correct format.
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Greeted {} time(s)!", greeting_account.counter);

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
