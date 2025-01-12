// filepath: /home/shanjiv/hackverse/dcbms/src/app/register.js
"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetaMaskContext } from "@/context/MetaMaskContext";
import { useContext } from "react";

export default function Register() {
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [userName, setUserName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const getProvider = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");

  const getContract = async (withSigner = false) => {
    const provider = await getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const checkRegistration = async () => {
    if (account) {
      const contract = await getContract();
      const isRegistered = await contract.isUserRegistered(account);
      setIsRegistered(isRegistered);
    }
  };

  useEffect(() => {
    checkRegistration();
  }, [account, isRegistered]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!account) {
        throw new Error("Please connect to MetaMask to register");
      }

      const contract = await getContract(true);

      const tx = await contract.registerUser(userName, registerNumber);
      await tx.wait();

      setSuccess("User registered successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {!isRegistered && (
        <div className="p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Register User</h1>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="">Name</label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="">Register Number</label>
              <Input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              {!account && (
                <Button onClick={connectToMetaMask} disabled={isLoading}>
                  {isLoading ? "Connecting..." : "Connect to MetaMask"}
                </Button>
              )}
              {account && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              )}
            </div>
          </form>
          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mt-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
