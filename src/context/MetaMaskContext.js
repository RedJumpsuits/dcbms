import React, { createContext, useState, useEffect } from 'react';

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

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

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  useEffect(() => {
    const restoreConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
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
    <MetaMaskContext.Provider value={{ account, isConnecting, connectToMetaMask }}>
      {children}
    </MetaMaskContext.Provider>
  );
};