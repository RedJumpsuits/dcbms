import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState(null);
  const [registerNumber, setRegisterNumber] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");

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

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const setUserDetails = async () => {
    const contract = await getContract(true);

    if (account) {
      const userDetails = await contract.users(account);
      setName(userDetails.name);
      setRegisterNumber(userDetails.registerNumber);
    }

    
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      setUserDetails();
    }
  }, [account, name, registerNumber]);

  useEffect(() => {
    const restoreConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]); // Set the account if already connected
          }
        } catch (error) {
          console.error("Error restoring MetaMask connection:", error);
        }
      }
    };

    restoreConnection();
  }, []);

  return (
    <MetaMaskContext.Provider
      value={{ account, isConnecting, connectToMetaMask }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};
