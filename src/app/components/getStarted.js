import React from "react";
import TextReveal from "@/components/ui/text-reveal";
import { MagicCard } from "@/components/ui/magic-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function GetStarted() {
  return (
    <div className="flex flex-col">
      <TextReveal
        className={"text-xl"}
        text="Our platform transforms campus resource management at NITK by using blockchain and AI. It offers a seamless way for students and faculty to book sports facilities, labs, and library slots, ensuring tamper-proof bookings and accountability through ETH staking to minimize no-shows."
      />
      <div className="grid grid-cols-4 gap-4 px-32 z-0">
        <MagicCard>
          <div>
            <CardHeader>
              <CardTitle>Install MetaMask Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get started by installing MetaMask on your browser or mobile
                device. It’s your gateway to securely book and manage campus
                resources. Set up your wallet and be ready to interact with the
                platform.
              </CardDescription>
            </CardContent>
          </div>
        </MagicCard>

        <MagicCard>
          <div>
            <CardHeader>
              <CardTitle>Connect MetaMask to Access Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                After installing MetaMask, link your wallet to our platform.
                This will allow you to choose and stake your desired campus
                facility, ensuring your booking is secure and your access is
                guaranteed.
              </CardDescription>
            </CardContent>
          </div>
        </MagicCard>

        <MagicCard>
          <div>
            <CardHeader>
              <CardTitle>Book Your Facility</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Select your preferred time slot for the facility you want to
                book. Secure your booking by staking tokens as a deposit,
                ensuring a responsible reservation process.
              </CardDescription>
            </CardContent>
          </div>
        </MagicCard>

        <MagicCard>
          <div>
            <CardHeader>
              <CardTitle>Scan QR to Confirm Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upon arrival at the venue, scan your unique QR code to confirm
                your attendance. This ensures transparency, accountability, and
                smooth operation of campus resources.
              </CardDescription>
            </CardContent>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}

export default GetStarted;
