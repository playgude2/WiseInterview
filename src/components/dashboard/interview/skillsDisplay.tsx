"use client";

import Image from "next/image";
import { Skill } from "@/lib/skills";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SkillsDisplayProps {
  skills: Skill[];
}

export function SkillsDisplay({ skills }: SkillsDisplayProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {skills.map((skill) => (
        <TooltipProvider key={skill.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                <Image
                  src={skill.logo}
                  alt={skill.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>{skill.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
