import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";
import { Heart, Users, Lightbulb, Zap } from "lucide-react";

interface Props {
  interviewer: Interviewer | undefined;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  return (
    <div className="text-center w-[40rem]">
      <CardTitle className="text-3xl text mt-0 p-0 font-semibold ">
        {interviewer?.name}
      </CardTitle>
      <div className="mt-1 p-2 flex flex-col justify-center items-center">
        <div className="flex flex-row justify-center space-x-10 items-center">
          <div className=" flex items-center justify-center border-4 overflow-hidden border-gray-500 rounded-xl h-48 w-44">
            <Image
              src={interviewer?.image || ""}
              alt="Picture of the interviewer"
              width={180}
              height={30}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-relaxed  mt-0 whitespace-normal w-[25rem] text-justify">
              {interviewer?.description}
            </p>
            {interviewer?.audio && (
              <ReactAudioPlayer src={`/audio/${interviewer.audio}`} controls />
            )}
          </div>
        </div>
        <h3 className="text-lg m-0 p-0 mt-6 ml-0 font-semibold">
          Interviewer Metrics
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-3 w-full">
          {/* Empathy */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-rose-500 rounded-lg p-2">
                  <Heart size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Empathy</h4>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-rose-200 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(interviewer?.empathy || 10) / 10 * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-rose-600 w-12 text-right">
                {interviewer?.empathy || 10}/10
              </span>
            </div>
          </div>

          {/* Rapport */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-lg p-2">
                  <Users size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Rapport</h4>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(interviewer?.rapport || 10) / 10 * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600 w-12 text-right">
                {interviewer?.rapport || 10}/10
              </span>
            </div>
          </div>

          {/* Exploration */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 rounded-lg p-2">
                  <Lightbulb size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Exploration</h4>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(interviewer?.exploration || 10) / 10 * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600 w-12 text-right">
                {interviewer?.exploration || 10}/10
              </span>
            </div>
          </div>

          {/* Speed */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 rounded-lg p-2">
                  <Zap size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">Speed</h4>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(interviewer?.speed || 10) / 10 * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600 w-12 text-right">
                {interviewer?.speed || 10}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewerDetailsModal;
