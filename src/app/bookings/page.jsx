"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceBookingForm from "@/app/components/PlaceBookingForm";
import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { MetaMaskContext } from "@/context/MetaMaskContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  const getProvider = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");
  // Get contract instance helper function
  const getContract = async (withSigner = false) => {
    const provider = await getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };
  
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [error, setError] = useState("");
  const [venues, setVenues] = useState([]);

  const loadVenues = async () => {
    try {
      const contract = await getContract();
      const venueList = await contract.getAllVenues();
      setVenues(venueList);
    } catch (err) {
      console.error("Error loading venues:", err);
      setError("Failed to load venues: " + err.message);
    }
  };

  const onSubmit = async (values) => {
    try {
      const contract = await getContract(true);
      const tx = await contract.createBooking({
        venueId: values.venue,
        day: values.startDateTime.getUTCDate(),
        hour: 0,
      });
    } catch (err) {
      console.error("Error placing booking:", err);
      setError("Failed to place booking: " + err.message);
    }
  };

  useEffect(() => {
    if (account) {
      console.log("Account detected:", account);
      loadVenues();
    }
  }, [account]);

  if (!account) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-20">
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Please connect your MetaMask wallet to access the admin dashboard.
            </AlertDescription>
          </Alert>
          <Button onClick={connectToMetaMask} className="mt-4">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container flex justify-center items-center w-full h-[100vh] mx-auto pt-20 p-4">
      <Card className="p-8 w-[80vh]">
        <CardHeader>
          <CardTitle>Book a venue</CardTitle>
        </CardHeader>
        {venues.length === 0 ? <></> : <PlaceBookingForm venueList={venues} />}
      </Card>
    </div>
  );
}
