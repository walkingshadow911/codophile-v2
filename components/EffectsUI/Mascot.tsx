"use client";
import React, { useEffect, useState, useRef } from "react";

export default function Mascot() {
  // Start the animation at frame 50 instead of 0
  const [frame, setFrame] = useState(50);
  
  // Grid layout remains the same
  const columns = 16;
  const rows = 16;

  // Set the precise boundaries for the loop
  const minFrame = 150; 
  const maxFrame = 248; // Index 248 is the 249th and final frame
  
  // Track whether the animation is playing forward (1) or backward (-1)
  const direction = useRef(1); 

  // Animation speed
  const fps = 25; 

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => {
        // If we hit the final frame going forward, reverse direction
        if (prevFrame >= maxFrame && direction.current === 1) {
          direction.current = -1;
          return prevFrame - 1;
        } 
        // If we hit frame 50 going backward, go forward again
        else if (prevFrame <= minFrame && direction.current === -1) {
          direction.current = 1;
          return prevFrame + 1;
        }
        
        // Otherwise, keep moving in the current direction
        return prevFrame + direction.current;
      });
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [fps]);

  // Calculate the current X and Y position on the grid
  const col = frame % columns;
  const row = Math.floor(frame / columns);

  // Use percentages so the sprite scales perfectly with the container
  const xPos = col * (100 / (columns - 1));
  const yPos = row * (100 / (rows - 1));

  return (
    <div 
      className="relative pointer-events-none z-10 mx-auto"
      style={{
        width: "160px",
        aspectRatio: "966 / 1280",
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://codophile-bucket.s3.ap-southeast-2.amazonaws.com/spritesheet+(2)+(1).png')",
          backgroundSize: `${columns * 100}% ${rows * 100}%`,
          backgroundPosition: `${xPos}% ${yPos}%`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}