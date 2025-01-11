"use client";
import React from "react";
import { useContext, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2 } from "lucide-react";
import { MetaMaskContext } from "@/context/MetaMaskContext";
import { ethers } from "ethers";

function Admin() {
  // Environment variables for contract configuration
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");

  // State management
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [venues, setVenues] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize provider outside of functions for reuse
  const getProvider = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
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

  // Check admin status when account changes
  useEffect(() => {
    if (account) {
      console.log("Account detected:", account);
      checkAdminStatus(account);
      loadVenues();
    }
  }, [account]);

  const checkAdminStatus = async (account) => {
    try {
      if (!account) {
        throw new Error("Please connect to MetaMask to use this application");
      }
      console.log("Checking admin status for account:", account);
      
      const contract = await getContract(true);
      console.log("Contract instance:", contract);
      
      const adminAddress = await contract.getAdminAddress();
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      
      console.log("Admin address:", adminAddress);
      console.log("Current address:", currentAddress);

      setIsAdmin(adminAddress.toLowerCase() === currentAddress.toLowerCase());
    } catch (error) {
      console.error("Error checking admin status:", error);
      setError(error.message);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!venueName || !capacity) {
        throw new Error("Please fill in all fields");
      }

      if (parseInt(capacity) <= 0) {
        throw new Error("Capacity must be greater than zero");
      }

      const contract = await getContract(true);
      const tx = await contract.addVenue(venueName, capacity);
      await tx.wait();

      setSuccess("Venue added successfully!");
      setVenueName("");
      setCapacity("");
      loadVenues();
    } catch (err) {
      console.error("Error adding venue:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-20">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              You must be the admin to access this dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-20">
      <h1 className="text-4xl font-bold">Welcome to the admin page</h1>
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Venue Name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Venue
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {venues.map((venue, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="font-medium">{venue.name}</div>
                  <div className="text-sm text-gray-500">
                    Capacity: {venue.capacity.toString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Status: {venue.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
              {venues.length === 0 && (
                <div className="text-gray-500 text-center">No venues found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Admin;