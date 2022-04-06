// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint storedData;

    // The constructor() is called only once, when the contract is deployed.
    // is the place to assign default values
    constructor() {
  		  storedData = 0;
  	}

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
