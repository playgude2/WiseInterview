"use client";

import Image from "next/image";
import React from "react";

interface ParticipantCardProps {
  name: string;
  image: string;
  isSpeaking: boolean;
  transcript: string;
  themeColor?: string;
}

export function ParticipantCard({
  name,
  image,
  isSpeaking,
  transcript,
  themeColor = "#4F46E5",
}: ParticipantCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-80 w-full">
      {/* Transcript */}
      <div className="h-32 flex items-center justify-center px-4 mb-4 overflow-hidden">
        <div className="text-center">
          <p className="text-sm md:text-base lg:text-lg leading-relaxed text-gray-800 font-normal line-clamp-4">
            {transcript || (
              <span className="text-gray-400 italic text-xs">
                {isSpeaking ? "Listening..." : "Waiting..."}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Participant Card */}
      <div className="flex flex-col items-center justify-center mb-3">
        {/* Profile Image Container */}
        <div
          className={`relative mb-3 transition-all duration-300 ${
            isSpeaking ? "scale-110" : "scale-100"
          }`}
        >
          {/* Outer glow ring when speaking */}
          {isSpeaking && (
            <>
              <div
                className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                style={{
                  backgroundColor: themeColor,
                  width: "100px",
                  height: "100px",
                  margin: "-5px",
                }}
              />
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  backgroundColor: themeColor,
                  width: "115px",
                  height: "115px",
                  margin: "-11px",
                }}
              />
            </>
          )}

          {/* Image */}
          <div
            className={`relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 flex-shrink-0 flex items-center justify-center bg-gray-200 ${
              isSpeaking ? "border-4" : "border-4"
            }`}
            style={{
              borderColor: isSpeaking ? themeColor : "#e5e7eb",
              boxShadow: isSpeaking
                ? `0 0 20px ${themeColor}40, 0 4px 12px rgba(0,0,0,0.15)`
                : "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Image
              src={image}
              alt={name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{name}</h3>

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isSpeaking ? "animate-pulse" : ""
              }`}
              style={{
                backgroundColor: isSpeaking ? themeColor : "#9ca3af",
              }}
            />
            <span
              className="text-xs font-medium transition-all duration-300"
              style={{
                color: isSpeaking ? themeColor : "#6b7280",
              }}
            >
              {isSpeaking ? "Speaking" : "Listening"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
