pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/*
 * Destructible pattern
 *
 * Problem: A deployed contract will exist as long as the Ethereum network
 * exists. If a contract’s lifetime is over, it must be possible to destroy a
 * contract and stop it from operating.

 * Solution: Use a selfdestruct call within a method that does a preliminary
 * authorization check of the invoking party.
 *
 * Result: Storage and code are removed from the state.
 *
 * Example: Loan, Bidding contracts
 */
contract Destructible is Ownable {

    //
    // ... other contract logic ...
    //

    /*
     * Destroys the contract, sending its funds to the contract owner.
     */
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    /*
     * Destroys the contract, sending its funds to the given recipient:
     *  > account
     *  > contract (even if doesn't have implement payable fallback function)
     *
     * Note: If Ether is sent to removed contract, the Ether will be forever lost.
     * Neither contracts nor “external accounts” are currently able to prevent that
     * someone sends them Ether, using selfdestruct().
     */
    function destroyAndSend(address recipient) public onlyOwner {
        selfdestruct(recipient);
    }

}