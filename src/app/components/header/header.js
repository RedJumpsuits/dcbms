"use client";
import Link from "next/link";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);

        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAccount(accounts[0]); // Save the first account
        setIsConnecting(false);
      } catch (error) {
        console.error("MetaMask connection failed:", error);
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="h-20 flex justify-between items-center px-32 py-2 ">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold">Campus Reserve</Link>
        <Link href="/Home">Home</Link>
        <Link href="/about">About</Link>
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
