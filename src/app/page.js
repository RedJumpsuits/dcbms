"use client";
import AnimatedBackground from "@/components/ui/anBG";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import InteractiveHoverButton from "@/components/ui/interactive-hover-button";
import GetStarted from "./components/getStarted";
import Particles from "@/components/ui/particles";
export default function Home() {
  return (
    <div className="pt-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 10 }}
        transition={{ duration: 1 }}
        className="rounded-[30px] overflow-hidden flex flex-col items-center justify-center relative w-full h-screen bg-gradient-to-br from-stone-500 via-blue-700 to-zinc-900"
      >
        <AnimatedBackground />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("/noise-light.png")`,
            backgroundRepeat: "inherit",
            mixBlendMode: "overlay",
          }}
        />
        <div className="absolute flex flex-col gap-4 justify-center">
          <h1 className="font-bold text-5xl px-32 text-center">
            Decentralized Campus Infrastructure Booking: Empowering
            Accountability and Efficiency
          </h1>
          <p className="text-xl text-center mt-4">
            Book, stake, and access campus resources seamlessly—on time, every
            time.
          </p>
          <div className="w-full flex justify-center">
            <InteractiveHoverButton
              text={"Get Started"}
              className="w-[200px]"
            />
          </div>
        </div>
      </motion.div>

      <GetStarted />
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        // color={color}
        refresh
      />
    </div>
  );
}
