// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract ENSRegistry {
    // Mapping: NameHash -> Owner Address
    mapping(bytes32 => address) public owner;

    // Mapping: NameHash -> Resolver Contract Address
    mapping(bytes32 => address) public resolver;

    event NewOwner(bytes32 indexed node, address owner);
    event NewResolver(bytes32 indexed node, address resolver);

    // Set the owner of a name (node)
    function setOwner(bytes32 node, address _owner) external {
        require(owner[node] == address(0) || owner[node] == msg.sender, "Not authorized");
        
        owner[node] = _owner;
        emit NewOwner(node, _owner);
    }

    // Set the resolver for a name
    function setResolver(bytes32 node, address _resolver) external {
        require(owner[node] == msg.sender, "Only owner can set resolver");
        resolver[node] = _resolver;
        emit NewResolver(node, _resolver);
    }
}