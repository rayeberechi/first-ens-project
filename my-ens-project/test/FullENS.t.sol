// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/ENSRegistry.sol";
import "../src/PublicResolver.sol";

contract FullENSTest is Test {
    ENSRegistry registry;
    PublicResolver resolver;
    
    // In ENS, we don't store "faith", we store keccak256("faith")
    bytes32 node = keccak256(abi.encodePacked("faith"));

    function setUp() public {
        // 1. Deploy Registry
        registry = new ENSRegistry();
        
        // 2. Deploy Resolver (and tell it where the Registry is)
        resolver = new PublicResolver(address(registry));
    }

    function testFullFlow() public {
        // --- STEP 1: Claim the name in Registry ---
        // I want to own "faith"
        registry.setOwner(node, address(this));
        
        // Verify I am the owner
        assertEq(registry.owner(node), address(this));

        // --- STEP 2: Point to the Resolver ---
        // Tell Registry: "For details about 'faith', go to this Resolver contract"
        registry.setResolver(node, address(resolver));
        
        // Verify registry knows the resolver
        assertEq(registry.resolver(node), address(resolver));

        // --- STEP 3: Set the Address in the Resolver ---
        // Tell Resolver: "'faith' resolves to my wallet address"
        resolver.setAddr(node, address(this));
        
        // Verify the lookup works
        assertEq(resolver.addr(node), address(this));
    }
}

