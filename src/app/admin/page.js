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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Admin() {
  // Environment variables for contract configuration
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const CONTRACT_ABI = JSON.parse(process.env.NEXT_PUBLIC_ABI || "[]");

  // State management
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [error2, setError2] = useState("");
  const [success, setSuccess] = useState("");
  const [venues, setVenues] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [users, setUsers] = useState([]);

  // Initialize provider outside of functions for reuse
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
      console.log(venueList);
    } catch (err) {
      console.error("Error loading venues:", err);
      setError("Failed to load venues: " + err.message);
    }
  };

  const loadUsersByName = async (name) => {
    try {
      const contract = await getContract();
      const userList = await contract.getUsersByName(name);

      console.log(userList);

      console.log(userList);
      setUsers(userList);
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

  const handleRemoveFlag = async (address) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!address) {
        throw new Error("Please enter a user address");
      }

      const contract = await getContract(true);

      // Call the smart contract function to remove flag
      await contract.removeDamageFlag(address);
      setSuccess(`Successfully removed flag from user ${address}`);
      setUserAddress("");
    } catch (err) {
      setError(err.message || "Failed to remove user flag");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (name) => {
    await loadUsersByName(name);

    if (userName.trim()) {
      const user = users.find((user) =>
        user.name.toLowerCase().includes(userName.toLowerCase())
      );
      if (user) {
        setUserAddress(user.address);
      } else {
        setError2("User not found");
      }
    }
  };

  const handleFlagUser = async (address) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!address) {
        throw new Error("Please enter a user address");
      }

      const contract = await getContract(true);
      // Call the smart contract function to flag user
      await contract.flagDamagedProperty(address);
      setSuccess(`Successfully flagged user ${address}`);
      setUserAddress("");
    } catch (err) {
      setError(err.message || "Failed to flag user");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="mt-20 px-32">
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
                <AlertDescription>{error2}</AlertDescription>
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
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search and Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter User Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => {
                  handleSearchUser(userName);
                }}
                className="w-full"
              >
                Search User
              </Button>

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

              {users && users.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  {users.map((user, index) => (
                    <TableBody key={index}>
                      <TableRow>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.userAddress}</TableCell>
                        {user.isFlagged ? (
                          <Button
                            onClick={() => {
                              handleRemoveFlag(user.userAddress);
                            }}
                          >
                            Unflag
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              handleFlagUser(user.userAddress);
                            }}
                          >
                            Flag
                          </Button>
                        )}
                      </TableRow>
                    </TableBody>
                  ))}
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Admin;
