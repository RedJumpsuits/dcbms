"use client"
import React, { useState } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = process.env.NEXT_PUBLIC_ABI;

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

const Home = () => {
    const [data, setData] = useState(null);

    const submitToBlockchain = async (venueId, timestamp) => {
        const date = new Date(timestamp * 1000 - 5*60*1000);

        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        date.setHours(0)

        const day = Math.floor(date.getTime() / 1000);


        const hour = Math.floor((timestamp % 86400) / 3600);

        const contract = await getContract(true);

        console.log(hour, day, venueId);

        try {
            const tx = await contract.checkout(venueId, day, hour);
            console.log(venueId, day, hour);
            console.log('Transaction hash:', tx.hash);
            await tx.wait();
            console.log('Transaction confirmed');
            
        } catch (error) {
            console.error('Error submitting to blockchain:', error);
        }
    };

    const handleScan = (data) => {
        setData(data);
        const { venueId, timeStamp } = data;
        submitToBlockchain(venueId, timeStamp);
        // window.location.href = "/";
    };

    return (
        <div className='pt-20 flex-col justify-center items-center min-h-screen'>
            <h1 className='text-3xl font-bold text-center'>QR Code Scanner</h1>
            <QRCodeScanner onScan={handleScan} />
            {data && (
                <div>
                    <p><strong>Venue ID:</strong> {data.venueId}</p>
                    <p><strong>Timestamp:</strong> {data.timeStamp}</p>
                </div>
            )}
        </div>
    );
};

export default Home;
