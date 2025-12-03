import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";
import { extractSkillsFromDescription } from "@/lib/skills";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
  description?: string;
  respondents?: string[];
  themeColor?: string;
  createdAt?: string | Date;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({
  name,
  interviewerId,
  id,
  url,
  readableSlug,
  description,
  respondents,
  themeColor,
  createdAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [fetchedRespondents, setFetchedRespondents] = useState<string[]>([]);

  const desc = description ?? "";
  const respondentsList = fetchedRespondents.length > 0 ? fetchedRespondents : (respondents ?? []);
  const color = themeColor ?? "indigo";

  // Check if interview is new (created within last 24 hours)
  const isNew = createdAt && ((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60) < 24);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer =
        await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
      setInterviewerName(interviewer.name || "");
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (desc) {
      const extractedSkills = extractSkillsFromDescription(desc);
      setSkills(extractedSkills);
    }
  }, [desc]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);

        // Extract unique respondent names
        const respondentNames = responses
          .map((response: any) => response.name)
          .filter((name: string) => name && name.trim());
        const uniqueRespondents = Array.from(new Set(respondentNames));
        setFetchedRespondents(uniqueRespondents);

        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (error) {
                console.error(
                  `Failed to call api/get-call for response id ${response.call_id}:`,
                  error,
                );
              }
            }
          }
          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(
        readableSlug ? `${base_url}/call/${readableSlug}` : (url as string),
      )
      .then(
        () => {
          setCopied(true);
          toast.success(
            "The link to your interview has been copied to your clipboard.",
            {
              position: "bottom-right",
              duration: 3000,
            },
          );
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        },
        (err) => {
          console.log("failed to copy", err.mesage);
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug
      ? `/call/${readableSlug}`
      : `/call/${url}`;
    window.open(interviewUrl, "_blank");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const themeColorMap: Record<string, string> = {
    indigo: "bg-indigo-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    pink: "bg-pink-600",
    red: "bg-red-600",
    green: "bg-green-600",
  };

  const selectedThemeColor =
    themeColorMap[color?.toLowerCase() || "indigo"] ||
    themeColorMap.indigo;

  return (
    <Card className="relative p-0 mt-4 inline-block w-72 h-96 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      style={{
        opacity: isFetching ? 0.6 : 1,
      }}
    >
      <CardContent className={`p-0 flex flex-col h-full`}>
        {/* Header Section */}
        <div className={`w-full px-4 pt-4 pb-3 ${selectedThemeColor}`}>
          <CardTitle className="text-white text-base font-semibold line-clamp-2">
            {name}
          </CardTitle>
          {isFetching && (
            <div className="mt-2">
              <MiniLoader />
            </div>
          )}
        </div>

        {/* Skills Section with NEW Badge */}
        {(skills.length > 0 || isNew) && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-700">Skills:</p>
              {isNew && (
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  NEW
                </span>
              )}
            </div>
            {skills.length > 0 && (
              <div className="flex items-center">
                <div className="flex -space-x-1">
                  {skills.slice(0, 4).map((skill, idx) => (
                    <div
                      key={skill.name}
                      className="group relative"
                      style={{ zIndex: 4 - idx }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200 shadow-sm"
                        title={skill.name}
                      >
                        <Image
                          src={skill.logo}
                          alt={skill.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                        {skill.name}
                      </div>
                    </div>
                  ))}
                </div>
                {skills.length > 4 && (
                  <div className="group relative ml-1">
                    <div className="w-7 h-7 rounded-lg bg-gray-300 flex items-center justify-center text-xs font-bold text-white border border-gray-300 cursor-pointer hover:bg-gray-400 transition-colors shadow-sm">
                      +{skills.length - 4}
                    </div>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 max-w-xs">
                      {skills.slice(4).map(s => s.name).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description Section */}
        {desc && (
          <div className="px-4 py-2">
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          </div>
        )}

        {/* Interviewer & Respondents Section */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          {/* Respondent Avatars */}
          <div className="space-y-1 mb-4">
            <p className="text-xs font-medium text-gray-700">Respondents:</p>
            {respondentsList.length > 0 ? (
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {respondentsList.slice(0, 3).map((respondent, idx) => (
                    <div
                      key={respondent}
                      className="group relative"
                      style={{ zIndex: 3 - idx }}
                    >
                      <div
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-sm"
                        title={respondent}
                      >
                        {getInitials(respondent)}
                      </div>
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                        {respondent}
                      </div>
                    </div>
                  ))}
                </div>
                {respondentsList.length > 3 && (
                  <div className="group relative ml-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-sm">
                      +{respondentsList.length - 3}
                    </div>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 max-w-xs">
                      {respondentsList.slice(3).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No respondents yet</div>
            )}
          </div>

          {/* Interviewer Info */}
          <div className="flex items-center gap-2">
            {img && (
              <div className="w-12 h-12 overflow-hidden rounded-full flex-shrink-0 border border-gray-200">
                <Image
                  src={img}
                  alt="Picture of the interviewer"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {interviewerName}
              </p>
              <p className="text-xs text-gray-500">
                {responseCount?.toString() || 0} responses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <a
            href={`/interviews/${id}`}
            className="flex-1"
            onClick={(e) => {
              if (isFetching) {
                e.preventDefault();
              }
            }}
          >
            <Button
              className="w-full text-xs h-9 font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isFetching}
            >
              View Details
            </Button>
          </a>
          <Button
            className="text-xs px-3 h-9 text-indigo-600"
            variant={"secondary"}
            title="View Interview"
            disabled={isFetching}
            onClick={handleJumpToInterview}
          >
            <ArrowUpRight size={16} />
          </Button>
          <Button
            className={`text-xs px-3 h-9 ${
              copied ? "bg-indigo-300 text-white" : "text-indigo-600"
            }`}
            variant={"secondary"}
            title="Copy Link"
            disabled={isFetching}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              copyToClipboard();
            }}
          >
            {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default InterviewCard;
