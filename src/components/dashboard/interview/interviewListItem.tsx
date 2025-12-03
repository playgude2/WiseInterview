import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import { InterviewerService } from "@/services/interviewers.service";
import { extractSkillsFromDescription, extractKeywordsFromDescription } from "@/lib/skills";
import ShareInterviewModal from "@/components/dashboard/interview/shareInterviewModal";

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

function InterviewListItem({
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
  const [keywords, setKeywords] = useState<string[]>([]);
  const [fetchedRespondents, setFetchedRespondents] = useState<string[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const desc = description ?? "";
  const respondentsList = fetchedRespondents.length > 0 ? fetchedRespondents : (respondents ?? []);
  const color = themeColor ?? "indigo";

  // Check if interview is new (created within last 24 hours)
  const isNew = createdAt && ((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60) < 24);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
      setInterviewerName(interviewer.name || "");
    };
    fetchInterviewer();
  }, [interviewerId]);

  useEffect(() => {
    if (desc) {
      const extractedSkills = extractSkillsFromDescription(desc);
      setSkills(extractedSkills);

      if (extractedSkills.length === 0) {
        const extractedKeywords = extractKeywordsFromDescription(desc);
        setKeywords(extractedKeywords);
      } else {
        setKeywords([]);
      }
    }
  }, [desc]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);

        const respondentNames = responses
          .map((response: any) => response.name)
          .filter((name: string) => name && name.trim());
        const uniqueRespondents = Array.from(new Set<string>(respondentNames));
        setFetchedRespondents(uniqueRespondents);

        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                await axios.post("/api/get-call", {
                  id: response.call_id,
                });
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
  }, [id]);

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

  const handleShareInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsShareModalOpen(true);
  };

  const getInterviewLink = () => {
    return readableSlug ? `/call/${readableSlug}` : `/call/${url}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Interview Info */}
      <div className="flex-1 flex items-center gap-4">
        {/* Interviewer Image */}
        <div className="flex-shrink-0">
          {img && (
            <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200">
              <Image
                src={img}
                alt="Interviewer"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Interview Name and Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </p>
            {isNew && (
              <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                NEW
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {interviewerName} • {responseCount?.toString() || 0} responses
          </p>
          {desc && (
            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* Skills/Keywords */}
      <div className="flex-shrink-0 px-4 w-48">
        {skills.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {skills.slice(0, 3).map((skill) => (
              <div
                key={skill.name}
                className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm"
                title={skill.name}
              >
                <Image
                  src={skill.logo}
                  alt={skill.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
              </div>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-gray-500 flex items-center ml-1">
                +{skills.length - 3}
              </span>
            )}
          </div>
        ) : keywords.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {keywords.slice(0, 3).map((keyword) => (
              <span
                key={keyword}
                className="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium leading-tight"
                style={{ fontSize: "10px" }}
              >
                {keyword}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="text-gray-500 flex items-center leading-tight" style={{ fontSize: "10px" }}>
                +{keywords.length - 3}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Respondents Count */}
      <div className="flex-shrink-0 w-20 text-center">
        <p className="text-sm font-medium text-gray-900">
          {respondentsList.length}
        </p>
        <p className="text-xs text-gray-500">respondents</p>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2 ml-4">
        <a href={`/interviews/${id}`} className="flex-shrink-0">
          <Button
            className="text-xs h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isFetching}
          >
            View
          </Button>
        </a>
        <Button
          className="text-xs px-2 h-8 text-indigo-600"
          variant={"secondary"}
          title="Share Interview"
          disabled={isFetching}
          onClick={handleShareInterview}
        >
          <ArrowUpRight size={14} />
        </Button>
        <Button
          className={`text-xs px-2 h-8 ${
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
          {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <ShareInterviewModal
        isOpen={isShareModalOpen}
        interviewLink={getInterviewLink()}
        interviewName={name || "Interview"}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}

export default InterviewListItem;
