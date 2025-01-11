"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
import { Label } from "@/components/ui/label";
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

const places = [
  { id: "1", name: "Conference Room A", seats: 10 },
  { id: "2", name: "Meeting Room B", seats: 6 },
  { id: "3", name: "Auditorium", seats: 100 },
  { id: "4", name: "Boardroom", seats: 12 },
];

const formSchema = z.object({
  place: z.string({
    required_error: "Please select a place to book.",
  }),
  startDateTime: z.date({
    required_error: "Please select a start date and time.",
  }),
  endDateTime: z.date({
    required_error: "Please select an end date and time.",
  }),
  stake: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid positive number for the stake.",
  }),
});

export default function PlaceBookingForm() {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values) {
    console.log(values);
    // Here you would typically send this data to your backend
    alert("Booking submitted! Check the console for details.");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a place to book" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      <div>
                        {place.name} ({place.seats} seats){" "}
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
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date) {
                        const dateTime = new Date(date);
                        dateTime.setHours(new Date().getHours());
                        dateTime.setMinutes(new Date().getMinutes());
                        field.onChange(dateTime);
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3">
                    <Input
                      type="time"
                      onChange={(e) => {
                        if (startDate) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(startDate);
                          newDate.setHours(parseInt(hours));
                          newDate.setMinutes(parseInt(minutes));
                          field.onChange(newDate);
                        }
                      }}
                    />
                  </div>
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
          name="endDateTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date and Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      if (date) {
                        const dateTime = new Date(date);
                        dateTime.setHours(new Date().getHours());
                        dateTime.setMinutes(new Date().getMinutes());
                        field.onChange(dateTime);
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3">
                    <Input
                      type="time"
                      onChange={(e) => {
                        if (endDate) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(endDate);
                          newDate.setHours(parseInt(hours));
                          newDate.setMinutes(parseInt(minutes));
                          field.onChange(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the end date and time for your booking.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stake"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stake</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter stake amount"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the stake amount for your booking.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Book Place</Button>
      </form>
    </Form>
  );
}
