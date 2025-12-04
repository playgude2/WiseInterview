"use client";

import React, { useEffect, useState } from "react";
import { Analytics, CallData } from "@/types/response";
import axios from "axios";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import ReactAudioPlayer from "react-audio-player";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponseService } from "@/services/responses.service";
import { useRouter } from "next/navigation";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ModernScoreGauge,
  LinearProgressBar,
  ProgressPill,
  BulletGraph,
  SegmentedProgress,
  DonutProgress,
  RadialBar,
  WaveProgress,
  MinimalistBadge,
} from "@/components/ui/progress-variants";
import QuestionAnswerCard from "@/components/dashboard/interview/questionAnswerCard";
import { marked } from "marked";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import { ArrowLeft } from "lucide-react";

type CallProps = {
  call_id: string;
  onDeleteResponse: (deletedCallId: string) => void;
  onCandidateStatusChange: (callId: string, newStatus: string) => void;
};

function CallInfo({
  call_id,
  onDeleteResponse,
  onCandidateStatusChange,
}: CallProps) {
  const [call, setCall] = useState<CallData>();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [tabSwitchCount, setTabSwitchCount] = useState<number>();
  const [progressStyle, setProgressStyle] = useState<string>("linear");

  type ProgressStyleType = "modern" | "linear" | "pill" | "bullet" | "segmented" | "donut" | "radial" | "wave" | "badge";

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      setCall(undefined);
      setEmail("");
      setName("");

      try {
        const response = await axios.post("/api/get-call", { id: call_id });
        setCall(response.data.callResponse);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call_id]);

  useEffect(() => {
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        const response = await ResponseService.getResponseByCallId(call_id);
        setEmail(response.email);
        setName(response.name);
        setCandidateStatus(response.candidate_status);
        setInterviewId(response.interview_id);
        setTabSwitchCount(response.tab_switch_count);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call_id]);

  useEffect(() => {
    const replaceAgentAndUser = (transcript: string, name: string): string => {
      const agentReplacement = "**AI interviewer:**";
      const userReplacement = `**${name}:**`;

      // Replace "Agent:" with "AI interviewer:" and "User:" with the variable `${name}:`
      let updatedTranscript = transcript
        .replace(/Agent:/g, agentReplacement)
        .replace(/User:/g, userReplacement);

      // Add space between the dialogues
      updatedTranscript = updatedTranscript.replace(/(?:\r\n|\r|\n)/g, "\n\n");

      return updatedTranscript;
    };

    if (call && name) {
      setTranscript(replaceAgentAndUser(call?.transcript as string, name));
    }
  }, [call, name]);

  const onDeleteResponseClick = async () => {
    try {
      const response = await ResponseService.getResponseByCallId(call_id);

      if (response) {
        const interview_id = response.interview_id;

        await ResponseService.deleteResponse(call_id);

        router.push(`/interviews/${interview_id}`);

        onDeleteResponse(call_id);
      }

      toast.success("Response deleted successfully.", {
        position: "bottom-right",

        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting response:", error);

      toast.error("Failed to delete the response.", {
        position: "bottom-right",

        duration: 3000,
      });
    }
  };

  const getScoreColor = (score: number, maxValue: number = 100): string => {
    const percentage = (score / maxValue) * 100;
    if (percentage < 36) {
      return "#ef4444";
    } else if (percentage < 50) {
      return "#f59e0b";
    } else {
      return "#22c55e";
    }
  };

  const renderProgressComponent = (score: number, maxValue: number, label: string) => {
    const percentage = (score / maxValue) * 100;
    const color = getScoreColor(score, maxValue);
    const props = { value: score, maxValue, label, color };

    switch (progressStyle) {
      case "linear":
        return <LinearProgressBar {...props} />;
      case "pill":
        return <ProgressPill {...props} />;
      case "bullet":
        return <BulletGraph {...props} />;
      case "segmented":
        return <SegmentedProgress {...props} />;
      case "donut":
        return <DonutProgress {...props} />;
      case "radial":
        return <RadialBar {...props} />;
      case "wave":
        return <WaveProgress {...props} />;
      case "badge":
        return <MinimalistBadge {...props} />;
      default:
        return <ModernScoreGauge {...props} />;
    }
  };

  return (
    <div className="h-screen z-[10] mx-2 mb-[100px] overflow-y-scroll">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[75%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:cursor-pointer transition-colors"
                onClick={() => {
                  router.push(`/interviews/${interviewId}`);
                }}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                <p className="text-sm font-semibold">Back to Summary</p>
              </div>
              <div className="h-7">
                {tabSwitchCount && tabSwitchCount > 0 && (
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-xs font-semibold">Tab Switching Detected</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-4">
              {/* Candidate Info */}
              <div className="flex flex-row gap-3 items-center flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold">{name ? name[0] : "A"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  {name && (
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  )}
                  {email && <p className="text-xs text-gray-600 truncate">{email}</p>}
                </div>
              </div>

              {/* Recording Controls */}
              {call?.recording_url && (
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <ReactAudioPlayer style={{ width: "200px" }} src={call?.recording_url} controls />
                  <a
                    href={call?.recording_url}
                    download=""
                    aria-label="Download"
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                    title="Download recording"
                  >
                    <DownloadIcon size={18} className="text-indigo-600" />
                  </a>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex flex-row items-center gap-2 flex-shrink-0">
                <Select
                  value={candidateStatus}
                  onValueChange={async (newValue: string) => {
                    setCandidateStatus(newValue);
                    await ResponseService.updateResponse(
                      { candidate_status: newValue },
                      call_id,
                    );
                    onCandidateStatusChange(call_id, newValue);
                  }}
                >
                  <SelectTrigger className="w-[150px] bg-white border-indigo-200 rounded-lg text-sm">
                    <SelectValue placeholder="Not Selected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CandidateStatus.NO_STATUS}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                        <span className="text-sm">No Status</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.NOT_SELECTED}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                        <span className="text-sm">Not Selected</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.POTENTIAL}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                        <span className="text-sm">Potential</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.SELECTED}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                        <span className="text-sm">Selected</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      disabled={isClicked}
                      className="bg-red-500 hover:bg-red-600 p-2 h-9 w-9"
                      size="sm"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this response.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-800"
                        onClick={async () => {
                          await onDeleteResponseClick();
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
          <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
            <div className="flex justify-between items-center mb-4">
              <p className="font-semibold">General Summary</p>
              <Select value={progressStyle} onValueChange={setProgressStyle}>
                <SelectTrigger className="w-[200px] bg-slate-50 rounded-lg">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern Gauge</SelectItem>
                  <SelectItem value="linear">Linear Bar</SelectItem>
                  <SelectItem value="pill">Progress Pill</SelectItem>
                  <SelectItem value="bullet">Bullet Graph</SelectItem>
                  <SelectItem value="segmented">Segmented</SelectItem>
                  <SelectItem value="donut">Donut Chart</SelectItem>
                  <SelectItem value="radial">Radial Bar</SelectItem>
                  <SelectItem value="wave">Wave Progress</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4 my-2 mt-4 ">
              {analytics?.overallScore !== undefined && analytics?.overallScore !== null && analytics?.overallScore !== 0 && (
                <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                  <div className="flex flex-row gap-4 align-middle justify-center">
                    {renderProgressComponent(
                      analytics.overallScore,
                      100,
                      "Overall Hiring Score"
                    )}
                  </div>
                  <div className="">
                    <div className="font-medium ">
                      <span className="font-normal">Feedback: </span>
                      {analytics?.overallFeedback === undefined ? (
                        <Skeleton className="w-[200px] h-[20px]" />
                      ) : (
                        analytics?.overallFeedback
                      )}
                    </div>
                  </div>
                </div>
              )}
              {analytics?.communication && analytics?.communication.score !== 0 && (
                <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                  <div className="flex flex-row gap-4 align-middle justify-center">
                    {renderProgressComponent(
                      analytics.communication.score,
                      10,
                      "Communication"
                    )}
                  </div>
                  <div className="">
                    <div className="font-medium ">
                      <span className="font-normal">Feedback: </span>
                      {analytics?.communication.feedback === undefined ? (
                        <Skeleton className="w-[200px] h-[20px]" />
                      ) : (
                        analytics?.communication.feedback
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                <div className="flex flex-row gap-2  align-middle">
                  <p className="my-auto">User Sentiment: </p>
                  <p className="font-medium my-auto">
                    {call?.call_analysis?.user_sentiment === undefined ? (
                      <Skeleton className="w-[200px] h-[20px]" />
                    ) : (
                      call?.call_analysis?.user_sentiment
                    )}
                  </p>

                  <div
                    className={`${
                      call?.call_analysis?.user_sentiment == "Neutral"
                        ? "text-yellow-500"
                        : call?.call_analysis?.user_sentiment == "Negative"
                          ? "text-red-500"
                          : call?.call_analysis?.user_sentiment == "Positive"
                            ? "text-green-500"
                            : "text-transparent"
                    } text-xl`}
                  >
                    ●
                  </div>
                </div>
                <div className="">
                  <div className="font-medium  ">
                    <span className="font-normal">Call Summary: </span>
                    {call?.call_analysis?.call_summary === undefined ? (
                      <Skeleton className="w-[200px] h-[20px]" />
                    ) : (
                      call?.call_analysis?.call_summary
                    )}
                  </div>
                </div>
                <p className="font-medium ">
                  {call?.call_analysis?.call_completion_rating_reason}
                </p>
              </div>
            </div>
          </div>
          {analytics &&
            analytics.questionSummaries &&
            analytics.questionSummaries.length > 0 && (
              <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
                <p className="font-semibold my-2 mb-4">Question Summary</p>
                <ScrollArea className="rounded-md h-72 text-sm mt-3 py-3 leading-6 overflow-y-scroll whitespace-pre-line px-2">
                  {analytics?.questionSummaries.map((qs, index) => (
                    <QuestionAnswerCard
                      key={qs.question}
                      questionNumber={index + 1}
                      question={qs.question}
                      answer={qs.summary}
                    />
                  ))}
                </ScrollArea>
              </div>
            )}
          <div className="bg-slate-200 rounded-2xl min-h-[150px] max-h-[500px] p-4 px-5 mb-[150px]">
            <p className="font-semibold my-2 mb-4">Transcript</p>
            <ScrollArea className="rounded-2xl text-sm h-96  overflow-y-auto whitespace-pre-line px-2">
              <div
                className="text-sm p-4 rounded-2xl leading-5 bg-slate-50"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: marked.parse(transcript) as string,
                }}
              />
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

export default CallInfo;
