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
  hour: z.bigint({
    required_error: "Please select a time slot.",
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
  const [startOpen, setStartOpen] = useState(false);
  const [slots, setSlots] = useState();
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const venues = props.venueList.map((venue, index) => {
    return { ...venue.toObject(), id: index };
  });

  const loadSlots = async (venueId, day) => {
    setSlotsLoading(true);
    setSlots(null);
    try {
      const contract = await getContract(true);
      const { timeSlots, bookedSlots, remainingSlots, userBookedAny } =
        await contract.getDailyBookings(venueId, day);

      setSlots({ timeSlots, bookedSlots, remainingSlots, userBookedAny });
      console.log(
        `ts ${timeSlots}, \nbs ${bookedSlots}, \nrs${remainingSlots}`
      );
    } catch (error) {
      console.log(error);
    }
    setSlotsLoading(false);
  };

  const createBooking = async (values) => {
    try {
      setLoading(true);
      const contract = await getContract(true);
      const tx = await contract.createBooking(
        venues.findIndex((venue) => venue.name === values.venue),
        values.startDateTime.getTime() / 1000,
        values.hour,
        { value: parseEther("0.0005") }
      );
      console.log(await tx.wait());
    } catch (err) {
      console.error("Error placing booking:", err);
    }
    setLoading(false);
  };

  function onSubmit(values) {
    console.log(values);
    createBooking(values);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit, (errors) => console.log(errors))();
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
                  onValueChange={(value) => {
                    form.resetField("startDateTime");
                    form.resetField("hour");
                    setSlots(null);
                    field.onChange(value);
                  }}
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
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
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
                          date.getTime() / 1000
                        );
                        setStartOpen(false);
                        form.resetField("hour");
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
          <FormField
            control={form.control}
            name="hour"
            render={({ field }) => (
              <>
                {slots && (
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {slots.timeSlots
                      .filter((slot) => {
                        let s =
                          (form.getValues("startDateTime").getDate() ==
                            new Date().getDate() &&
                            Number.parseInt(slot) > new Date().getHours()) ||
                          form.getValues("startDateTime").getDate() !=
                            new Date().getDate();
                        console.log(
                          Number.parseInt(slot),
                          Number.parseInt(slot) > new Date().getHours(),
                          form.getValues("startDateTime") ==
                            new Date().getDate()
                        );
                        console.log(form.getValues("startDateTime"));

                        return s;
                      })
                      .map((slot, index) => (
                        <Card
                          style={{ cursor: "pointer" }}
                          className={`p-0 ${
                            field.value == slot ? "bg-green-400" : ""
                          } ${slots.userBookedAny[index] ? "bg-gray-400" : ""}`}
                          key={index}
                          onClick={
                            slots.userBookedAny[index]
                              ? () => {
                                  alert("You have already booked this slot");
                                }
                              : () => {
                                  if (field.value == slot) {
                                    field.onChange(null);
                                  } else {
                                    field.onChange(slot);
                                  }
                                }
                          }
                        >
                          <CardHeader>
                            <CardTitle>
                              {slots.remainingSlots[index]} /{" "}
                              {slots.remainingSlots[index] +
                                slots.bookedSlots[index]}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {tConvert(slot.toString().padStart(2, "0"))}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          />
          {slotsLoading ? <div>Loading slots...</div> : <></>}
          <Button type="submit" disabled={loading}>
            {loading ? "Booking" : "Book"}
          </Button>
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
