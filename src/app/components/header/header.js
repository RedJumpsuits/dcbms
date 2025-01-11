"use client";
import Link from "next/link";
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useContext } from 'react';
import { MetaMaskContext } from '@/context/MetaMaskContext';

export default function Header() {
  const { account, isConnecting, connectToMetaMask } = useContext(MetaMaskContext);

  

  return (
    <div className="h-20 z-[999] fixed top-0 w-full flex justify-between items-center px-32 py-2 ">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold">ReserveX</Link>
        <Link href="/Home">Home</Link>
        <Link href="/about">About</Link>
      </div>
      <div className="flex gap-4 items-center justify-around">
        {!account && (
          <Button onClick={connectToMetaMask} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect to MetaMask"}
          </Button>
        )}
        {account && <div>Account Connected: {account}</div>}
      </div>
    </div>
  );
}
