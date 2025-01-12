"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { MetaMaskContext } from "@/context/MetaMaskContext";
import { ethers } from "ethers";

export default function Header() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");
  const { account, isConnecting, connectToMetaMask } =
    useContext(MetaMaskContext);

  const [user, setUser] = useState(null);
  const getProvider = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  // Get contract instance helper function
  const getContract = async (withSigner = false) => {
    const provider = await getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };
  console.log(account);
  const loadUsersByName = async (address) => {
    try {
      const contract = await getContract();
      const result= await contract.getUserDetails(address);
    } catch (err) {
      console.error("Error loading venues:", err);
      setError("Failed to load venues: " + err.message);
    }
  };

  useEffect(() => {
    if (account) loadUsersByName(account);
  }, [account]);
  return (
    <div className="h-20 bg-background/60 backdrop-blur-sm rounded-b-[30px] z-[999] fixed top-0 w-full flex justify-between items-center px-32 py-2 ">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold">
          ReserveX
        </Link>
        <Link href="/">Home</Link>
        {/* <Link href="/about">About</Link> */}
        <Link href="/bookings">Book</Link>
        <Link href="/scanqr">Check Out</Link>
        <Link href="/register">register</Link>
      </div>
      <div className="flex gap-4 items-center justify-around">
        {!account && (
          <Button onClick={connectToMetaMask} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect to MetaMask"}
          </Button>
        )}
        {account && <div>Account Connected</div>}
      </div>
    </div>
  );
}
