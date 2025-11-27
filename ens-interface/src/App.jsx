import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// --- CONFIGURATION ---
const REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const RESOLVER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const REGISTRY_ABI = [
  "function setOwner(bytes32 node, address owner) external",
  "function setResolver(bytes32 node, address resolver) external",
  "function resolver(bytes32 node) external view returns (address)"
];

const RESOLVER_ABI = [
  "function setAddr(bytes32 node, address addr) external",
  "function addr(bytes32 node) external view returns (address)"
];

function App() {
  const [name, setName] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("Connect Wallet");
  const [isConnected, setIsConnected] = useState(false);

  // Normalize names to lowercase to avoid errors
  const hashName = (n) => ethers.id(n.toLowerCase());

  // Connect Wallet Function
  async function connect() {
    if (window.ethereum) {
      try {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accs[0]);
        setIsConnected(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install MetaMask");
    }
  }

  // Auto-connect on load
  useEffect(() => {
    connect();
  }, []);

  async function getSigner() {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  }

  // --- ACTIONS ---

  async function step1_claim() {
    if (!name) return alert("Please enter a name");
    try {
      setStatus("Claiming ownership...");
      const signer = await getSigner();
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const tx = await registry.setOwner(hashName(name), await signer.getAddress());
      await tx.wait();
      setStatus("Step 1 Complete: You own the node!");
    } catch (err) { setStatus("Error in Step 1"); console.error(err); }
  }

  async function step2_link() {
    try {
      setStatus("Linking Resolver...");
      const signer = await getSigner();
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const tx = await registry.setResolver(hashName(name), RESOLVER_ADDRESS);
      await tx.wait();
      setStatus("Step 2 Complete: Resolver Linked!");
    } catch (err) { setStatus("Error in Step 2"); console.error(err); }
  }

  async function step3_setAddr() {
    try {
      setStatus("Storing Address...");
      const signer = await getSigner();
      const resolver = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, signer);
      const tx = await resolver.setAddr(hashName(name), await signer.getAddress());
      await tx.wait();
      setStatus("SUCCESS! Name Registered Globally.");
    } catch (err) { setStatus("Error in Step 3"); console.error(err); }
  }

  // --- LOOKUP FUNCTION ---
  async function lookup() {
    if (!lookupName) return;
    try {
      setResolvedAddress("Searching...");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
      
      // 1. Check Registry
      const node = hashName(lookupName);
      const resolverAddr = await registry.resolver(node);
      
      if (resolverAddr === ethers.ZeroAddress) {
        setResolvedAddress("⚠️ Name not registered.");
        return;
      }

      // 2. Check Resolver
      const resolver = new ethers.Contract(resolverAddr, RESOLVER_ABI, provider);
      const addr = await resolver.addr(node);
      
      if (addr === ethers.ZeroAddress) {
         setResolvedAddress("⚠️ Name owns a Node, but no Address set.");
      } else {
         setResolvedAddress(addr);
      }
      
    } catch (err) { 
        console.error(err);
        // Print error message on the UI
        setResolvedAddress("Error: " + (err.reason || err.message || "Check Console")); 
    }
  }

  return (
    <div className="fixed inset-0 overflow-y-auto w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-violet-950 flex flex-col items-center justify-center font-sans text-white p-4">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-lg pb-2">
          Decentralized Naming
        </h1>
        <p className="mt-2 text-gray-300 font-medium tracking-wide">
          Ethereum • Solidity • Ethers.js
        </p>
        
        {/* Connect Button */}
        <button 
          onClick={connect}
          className={`mt-4 px-6 py-2 rounded-full border border-white/20 text-sm font-mono transition-all hover:scale-105 ${isConnected ? 'bg-white/10 text-green-400' : 'bg-pink-600 text-white cursor-pointer animate-pulse'}`}
        >
          {isConnected ? `🟢 ${account.slice(0,6)}...${account.slice(-4)}` : '🔴 Connect Wallet'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl items-start justify-center">
        
        {/* CARD 1: REGISTER */}
        <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full">
          <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-pink-300">1. Register Identity</h2>
          
          <input 
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-6 transition-all"
            placeholder="e.g. faith" 
            onChange={(e) => setName(e.target.value)} 
          />
          
          <div className="space-y-3">
            <button onClick={step1_claim} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:scale-[1.02] transition-transform shadow-lg">
              1. Claim Ownership
            </button>
            <button onClick={step2_link} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] transition-transform shadow-lg">
              2. Link Resolver
            </button>
            <button onClick={step3_setAddr} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02] transition-transform shadow-lg">
              3. Set Address
            </button>
          </div>
          
          <div className="mt-6 h-10 flex items-center justify-center">
             <span className="text-sm font-bold text-yellow-300">{status}</span>
          </div>
        </div>

        {/* CARD 2: LOOKUP */}
        <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full h-full">
          <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-cyan-300">2. Resolve Identity</h2>
          
          <div className="flex gap-3 mb-6">
            <input 
              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="e.g. faith" 
              onChange={(e) => setLookupName(e.target.value)} 
            />
            <button onClick={lookup} className="px-6 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg">
              🔍
            </button>
          </div>
          
          <div className="bg-black/40 p-6 rounded-xl border border-white/10 text-center min-h-[100px] flex flex-col justify-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Resolved Address</p>
            <p className="font-mono text-green-400 text-lg break-all">
              {resolvedAddress || "Waiting for input..."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;