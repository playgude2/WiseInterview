import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";

interface Props {
  interviewer: Interviewer;
}

const interviewerCard = ({ interviewer }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);

  const metrics = [
    { label: "Empathy", value: interviewer.empathy },
    { label: "Rapport", value: interviewer.rapport },
    { label: "Exploration", value: interviewer.exploration },
    { label: "Speed", value: interviewer.speed },
  ];

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:shadow-lg ease-in-out duration-300 h-96 w-72 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md transition-shadow"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Section */}
          <div className="w-full h-48 overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-50">
            <Image
              src={interviewer.image}
              alt="Picture of the interviewer"
              width={280}
              height={192}
              className="w-auto h-auto max-w-full max-h-full object-contain"
            />
          </div>

          {/* Name Section */}
          <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1">
              {interviewer.name}
            </CardTitle>
          </div>

          {/* Metrics Section */}
          <div className="flex-1 px-4 py-2 overflow-y-auto">
            <p className="text-xs font-medium text-gray-700 mb-2">Metrics:</p>
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-600">
                      {metric.label}
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                      {metric.value}/10
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(metric.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Details Button */}
          <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <button className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors">
              View Details
            </button>
          </div>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default interviewerCard;
