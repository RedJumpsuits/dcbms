"use client"
import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CheckCircle2, RefreshCcw, Loader } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';

const QRScanner = () => {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getProvider = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getContract = async (withSigner = false) => {
    const provider = await getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const submitToBlockchain = async (venueId, timestamp) => {
    try {
      setIsProcessing(true);
      const date = new Date(timestamp * 1000 - 5*60*1000);
      
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      date.setHours(0);
      
      const day = Math.floor(date.getTime() / 1000);
      const hour = Math.floor((timestamp % 86400) / 3600);
      
      const contract = await getContract(true);
      console.log('Submitting to blockchain:', { venueId, day, hour });
      
      const tx = await contract.checkout(venueId, day, hour);
      await tx.wait();
      
      setCheckoutSuccess(true);
      await sleep(1000);
      window.location.href="/"
      setError('');
    } catch (error) {
      console.error('Blockchain error:', error);
      setError(error.message || 'Error submitting to blockchain');
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanup = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    startScanning();
    return cleanup;
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      setResult('');
      setCheckoutSuccess(false);
      
      if (!videoRef.current) return;

      scannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            // Ensure we're working with a string
            const rawData = result.data.toString().trim();
            console.log('Raw scan result:', rawData);
            
            // Try to parse the JSON
            let parsedData;
            try {
              parsedData = JSON.parse(rawData);
              console.log('Parsed data:', parsedData);
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              throw new Error('Invalid QR code format - not valid JSON');
            }

            // Handle the case where venueId might be a number or string
            const venueId = String(parsedData.venueId);
            const timeStamp = Number(parsedData.timeStamp);

            if (!venueId || isNaN(timeStamp)) {
              throw new Error('Invalid QR code data format');
            }

            setResult(rawData);
            cleanup();
            await submitToBlockchain(venueId, timeStamp);
          } catch (err) {
            console.error('Processing error:', err);
            setError(err.message);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full pt-20 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          QR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {checkoutSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Checkout successful!
              </AlertDescription>
            </Alert>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            
            {!isScanning && !error && !result && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white">Starting camera...</span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center space-y-2">
                  <Loader className="w-8 h-8 animate-spin text-white mx-auto" />
                  <span className="text-white text-sm">Processing transaction...</span>
                </div>
              </div>
            )}
          </div>

          {(result || checkoutSuccess) && !isProcessing && (
            <div className="space-y-4">
              <Button 
                onClick={startScanning}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Scan Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;