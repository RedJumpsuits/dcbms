"use client";

import React, { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { ethers } from "ethers";

export default function ScanQRPage() {
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");
  useEffect(() => {
    console.log("Component mounted");

    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);

        const qrScanner = new QrScanner(
          videoRef.current,

          async (result) => {
            console.log(result);
            qrScanner.stop();
            const data = JSON.parse(result.data);
            const now = new Date();
            now.setMilliseconds(0);
            now.setSeconds(0);
            now.setMinutes(0);
            const hour = now.getUTCHours();
            now.setHours(0);
            const date = Math.floor(now.getTime() / 1000);
            const contract = await getContract(true);
            const tx = await contract.checkout(data.venueId, date, hour);
            console.log("Transaction sent:", await tx.wait());
          },
          {
            onDecodeError: (err) => {
              console.error(err);
              setError(err.message);
            },
            maxScansPerSecond: 1,
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        qrScanner.start();
      })
      .catch((err) => {
        console.error(err);
        setError("Camera access denied");
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await QrScanner.scanImage(file);
        console.log(result);
        const data = JSON.parse(result.data);
        const now = new Date();
        now.setMilliseconds(0);
        now.setSeconds(0);
        now.setMinutes(0);
        const hour = now.getUTCHours();
        now.setHours(0);
        const date = Math.floor(now.getTime() / 1000);
        const contract = await getContract(true);
        const tx = await contract.checkout(data.venueId, date, hour);
        console.log("Transaction sent:", await tx.wait());
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
  };
  return (
    <div
      className="pt-40"
      style={{ maxWidth: "400px", height: "400px ", margin: "0 auto" }}
    >
      {error && <p>Error: {error}</p>}
      {!isCameraActive && !error && <p>Loading camera...</p>}
      <video ref={videoRef} style={{ width: "100%" }} />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "block", marginTop: "20px" }}
      />
    </div>
  );
}
