// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ENSRegistry.sol";

contract PublicResolver {
    // Mapping: NameHash -> ETH Address
    mapping(bytes32 => address) public addrs;
    
    ENSRegistry public registry;

    constructor(address _registry) {
        registry = ENSRegistry(_registry);
    }

    function setAddr(bytes32 node, address _addr) external {
        require(registry.owner(node) == msg.sender, "Only owner can set address");
        
        addrs[node] = _addr;
    }

    function addr(bytes32 node) external view returns (address) {
        return addrs[node];
    }
}