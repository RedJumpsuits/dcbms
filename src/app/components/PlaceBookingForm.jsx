"use client";

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Table } from "lucide-react";
import { format, set } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MetaMaskContext } from "@/context/MetaMaskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const { ethers, parseEther } = require("ethers");

const formSchema = z.object({
  venue: z.string({
    required_error: "Please select a place to book.",
  }),
  startDateTime: z.date({
    required_error: "Please select a start date and time.",
  }),
});

export default function PlaceBookingForm(props) {
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
  const { account, connectToMetaMask } = useContext(MetaMaskContext);
  const [startDate, setStartDate] = useState();
  const [startOpen, setStartOpen] = useState(false);
  const [slots, setSlots] = useState();
  const [hour, setHour] = useState();

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const venues = props.venueList.map((venue, index) => {
    return { ...venue.toObject(), id: index };
  });

  const loadSlots = async (venueId, day) => {
    try {
      const contract = await getContract(true);
      const { timeSlots, bookedSlots, remainingSlots } =
        await contract.getDailyBookings(venueId, day);

      setSlots({ timeSlots, bookedSlots, remainingSlots });
      console.log(
        `ts ${timeSlots}, \nbs ${bookedSlots}, \nrs${remainingSlots}`
      );
      console.log(timeSlots);
    } catch (error) {
      console.log(error);
    }
  };

  const createBooking = async (values) => {
    try {
      const contract = await getContract(true);
      const tx = await contract.createBooking({
        venueId: venues.findIndex((venue) => venue.name === values.venue),
        day: values.startDateTime.getTime()/ 1000,
        hour: hour,
      },
      { value: parseEther("0.0005") }
    );
      tx.console.log(await tx.wait());
    } catch (err) {
      console.error("Error placing booking:", err);
      setError("Failed to place booking: " + err.message);
    }
  };

  function onSubmit(values) {
    console.log("here");

    createBooking(values);

    // Here you would typically send this data to your backend
    alert("Booking submitted! Check the console for details.");
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("submitting form");
            form.handleSubmit(onSubmit, (errors) => console.log(errors))();
            // form.handleSubmit();
            e.preventDefault();
          }}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a place to book" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.name} value={venue.name}>
                        <div>
                          {venue.name} ({venue.capacity.toString()} seats){" "}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a place from the available options.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date and Time</FormLabel>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      disabled={!form.getValues("venue")}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {startDate ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      disabled={(date) => {
                        var now = new Date();
                        now.setMilliseconds(0);
                        now.setSeconds(0);
                        now.setMinutes(0);
                        now.setHours(0);
                        return !(
                          date >= now && date < now.setDate(now.getDate() + 3)
                        );
                      }}
                      onSelect={(date) => {
                        loadSlots(
                          venues.findIndex(
                            (venue) => venue.name === form.getValues("venue")
                          ),
                          date.getUTCDate()
                        );
                        setStartDate(date);
                        setStartOpen(false);
                        if (date) {
                          const dateTime = new Date(date);
                          field.onChange(dateTime);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the start date and time for your booking.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {slots && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {slots.timeSlots.map((slot, index) => (
                <Card
                  style={{ cursor: "pointer" }}
                  className={`p-0 ${hour == slot ? "bg-green-400" : ""}`}
                  key={index}
                  onClick={() => {
                    setHour(slot);
                    console.log(slot);
                  }}
                >
                  <CardHeader>
                    <CardTitle>
                      {slots.remainingSlots[index]} /{" "}
                      {slots.remainingSlots[index] + slots.bookedSlots[index]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tConvert(slot.toString().padStart(2, "0"))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button type="submit">Book Place</Button>
        </form>
      </Form>
    </div>
  );
}
function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])$/) || [time];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}
