"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Timer,
  Target,
  Zap,
  Trophy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showText?: boolean;
  className?: string;

  type?: "icon" | "text";
}

const Loader = ({
  size = "md",
  text = "Loading...",
  showText = true,
  className,
  type,
}: LoaderProps) => {
  const icons = [
    { Icon: Activity, name: "Activity" },
    { Icon: Dumbbell, name: "Dumbbell" },
    { Icon: Timer, name: "Timer" },
    { Icon: Target, name: "Target" },
    { Icon: Zap, name: "Zap" },
    { Icon: Trophy, name: "Trophy" },
  ];

  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Size configurations
  const sizeConfig = {
    sm: { icon: 16, text: "text-sm", container: "p-4" },
    md: { icon: 24, text: "text-base", container: "p-6" },
    lg: { icon: 32, text: "text-lg", container: "p-8" },
    xl: { icon: 48, text: "text-xl", container: "p-10" },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIconIndex((prev) => (prev + 1) % icons.length);
        setIsVisible(true);
      }, 150); // Half of the transition duration
    }, 500);

    return () => clearInterval(interval);
  }, [icons.length]);

  const CurrentIcon = icons[currentIconIndex].Icon;
  const currentSize = sizeConfig[size];

  return (
    <>
      {type === "icon" ? (
        <span className="flex gap-2 ">
          <CurrentIcon className={cn("h-4 w-4  text-white", className)} />
          <p> {text}</p>
        </span>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            currentSize.container,
            className
          )}
        >
          {/* Icon Container with Gradient Background */}
          <div className="relative">
            {/* Background Circle with Gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 animate-pulse" />

            {/* Rotating Background Ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 animate-spin"
              style={{ animationDuration: "3s" }}
            />

            {/* Icon Container */}
            <div
              className={cn(
                "relative flex items-center justify-center rounded-full bg-white shadow-lg",
                "transition-all duration-300 ease-in-out",
                isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
              )}
              style={{
                width: currentSize.icon + 32,
                height: currentSize.icon + 32,
              }}
            >
              <CurrentIcon
                className={cn(
                  "transition-all duration-300 ease-in-out text-blue-600",
                  isVisible ? "scale-100" : "scale-75"
                )}
                size={currentSize.icon}
              />
            </div>
          </div>

          {/* Loading Text */}
          {showText && (
            <div className="mt-4 text-center">
              <p
                className={cn(
                  "font-medium animate-pulse text-blue-600",
                  currentSize.text
                )}
              >
                {text}
              </p>

              {/* Animated Dots */}
            </div>
          )}

          {/* Progress Indicator */}

          <style jsx>{`
            @keyframes progress {
              0% {
                transform: translateX(-100%);
              }
              50% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

// Preset Loader Variants
export const SpinnerLoader = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center w-full", className)}>
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

export const FullScreenLoader = ({
  text = "Loading...",
}: {
  text?: string;
}) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <Loader size="xl" text={text} />
  </div>
);

export const InlineLoader = ({ text = "Loading..." }: { text?: string }) => (
  <Loader size="sm" text={text} showText={true} />
);

export const CardLoader = ({ className }: { className?: string }) => (
  <div
    className={cn("flex items-center justify-center min-h-[200px]", className)}
  >
    <Loader size="lg" text="Loading content..." />
  </div>
);

export const ButtonLoader = ({ text = "Loading..." }: { text?: string }) => (
  <Loader type="icon" size="sm" text={text} showText={false} />
);
export default Loader;


export const NormalLoader = ({ text = "Loading...", type = "text", className }: { text?: string, type?: "icon" | "text", className?: string }) => {
  const [activeIcon, setActiveIcon] = useState(0);

  const icons = [
    { Icon: Dumbbell, name: "Dumbbell" },
    { Icon: Timer, name: "Timer" },
    { Icon: Target, name: "Target" },
    { Icon: Zap, name: "Zap" },
    { Icon: Trophy, name: "Trophy" },
  ];

  useEffect(() => {
    // Change icon immediately on mount
    setActiveIcon(1);

    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % icons.length);
    }, 500);

    return () => clearInterval(interval);
  }, []); // Remove icons.length from dependency to avoid recreating interval

  const CurrentIcon = icons[activeIcon].Icon;

  return (
    type === "icon" ? (
      <span className="flex gap-2 ">
        <CurrentIcon className={cn("h-4 w-4  text-white")} />
        <p> {text}</p>
      </span>
    ) : (
      <div className={cn("flex flex-col items-center justify-center min-h-[400px] gap-4", className)}>
      <div className="relative">
        <CurrentIcon
          className="w-12 h-12 text-primary animate-pulse"
          strokeWidth={2}
        />
      </div>
      <p className="text-lg font-medium text-gray-700">{text}</p>
    </div>
      )
  );
};