"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { UserCircleIcon, SmileIcon, Info } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { CandidateStatus } from "@/lib/enum";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChartVariant,
  DonutChartVariant,
  BarChartVariant,
  StackedBarChartVariant,
  VerticalBarChartVariant,
  RadialChartVariant,
  NumericGaugeChart,
  NumericLinearChart,
} from "@/components/ui/chart-variants";
import { extractSkillsFromDescription } from "@/lib/skills";
import { SkillsDisplay } from "@/components/dashboard/interview/skillsDisplay";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info
            className="h-2 w-2 text-[#4F46E5] inline-block ml-0 align-super font-bold"
            strokeWidth={2.5}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-500 text-white font-normal">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const { interviewers } = useInterviewers();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [sentimentCount, setSentimentCount] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [callCompletion, setCallCompletion] = useState({
    complete: 0,
    incomplete: 0,
    partial: 0,
  });

  const totalResponses = responses.length;

  const [candidateStatusCount, setCandidateStatusCount] = useState({
    [CandidateStatus.NO_STATUS]: 0,
    [CandidateStatus.NOT_SELECTED]: 0,
    [CandidateStatus.POTENTIAL]: 0,
    [CandidateStatus.SELECTED]: 0,
  });

  const [tableData, setTableData] = useState<TableData[]>([]);

  // Chart style states
  const [sentimentChartStyle, setSentimentChartStyle] = useState<string>("pie");
  const [statusChartStyle, setStatusChartStyle] = useState<string>("bar");

  // Rendering functions for each metric
  const renderDurationChart = () => {
    const avgDurationSeconds = totalDuration / responses.length;
    const avgDurationMinutes = parseFloat((avgDurationSeconds / 60).toFixed(2));

    return (
      <NumericLinearChart
        value={avgDurationMinutes}
        maxValue={60}
        label="Average Duration"
        percentage={(avgDurationMinutes / 60) * 100}
        unit={`${avgDurationMinutes.toFixed(2)} min`}
      />
    );
  };

  const renderCompletionChart = () => {
    const completionPercentage = Math.round(
      (completedInterviews / responses.length) * 10000,
    ) / 100;

    return (
      <NumericGaugeChart
        value={completionPercentage}
        maxValue={100}
        label="Interview Completion Rate"
        percentage={completionPercentage}
        unit="%"
      />
    );
  };

  const renderSentimentChart = () => {
    const sentimentData = [
      {
        id: 0,
        value: sentimentCount.positive,
        label: `Positive (${sentimentCount.positive})`,
        color: "#22c55e",
      },
      {
        id: 1,
        value: sentimentCount.neutral,
        label: `Neutral (${sentimentCount.neutral})`,
        color: "#eab308",
      },
      {
        id: 2,
        value: sentimentCount.negative,
        label: `Negative (${sentimentCount.negative})`,
        color: "#eb4444",
      },
    ];

    switch (sentimentChartStyle) {
      case "donut":
        return <DonutChartVariant data={sentimentData} label="Candidate Sentiment" />;
      case "bar":
        return <BarChartVariant data={sentimentData} label="Candidate Sentiment" />;
      case "stacked":
        return <StackedBarChartVariant data={sentimentData} label="Candidate Sentiment" />;
      case "vertical":
        return <VerticalBarChartVariant data={sentimentData} label="Candidate Sentiment" />;
      case "radial":
        return <RadialChartVariant data={sentimentData} label="Candidate Sentiment" />;
      default:
        return <PieChartVariant data={sentimentData} label="Candidate Sentiment" />;
    }
  };

  const renderStatusChart = () => {
    const statusData = [
      {
        id: 0,
        value: candidateStatusCount[CandidateStatus.SELECTED],
        label: `Selected (${candidateStatusCount[CandidateStatus.SELECTED]})`,
        color: "#22c55e",
      },
      {
        id: 1,
        value: candidateStatusCount[CandidateStatus.POTENTIAL],
        label: `Potential (${candidateStatusCount[CandidateStatus.POTENTIAL]})`,
        color: "#eab308",
      },
      {
        id: 2,
        value: candidateStatusCount[CandidateStatus.NOT_SELECTED],
        label: `Not Selected (${candidateStatusCount[CandidateStatus.NOT_SELECTED]})`,
        color: "#eb4444",
      },
      {
        id: 3,
        value: candidateStatusCount[CandidateStatus.NO_STATUS],
        label: `No Status (${candidateStatusCount[CandidateStatus.NO_STATUS]})`,
        color: "#9ca3af",
      },
    ];

    switch (statusChartStyle) {
      case "donut":
        return <DonutChartVariant data={statusData} label="Candidate Status" />;
      case "bar":
        return <BarChartVariant data={statusData} label="Candidate Status" />;
      case "stacked":
        return <StackedBarChartVariant data={statusData} label="Candidate Status" />;
      case "vertical":
        return <VerticalBarChartVariant data={statusData} label="Candidate Status" />;
      case "radial":
        return <RadialChartVariant data={statusData} label="Candidate Status" />;
      default:
        return <PieChartVariant data={statusData} label="Candidate Status" />;
    }
  };

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      overallScore: response.analytics?.overallScore || 0,
      communicationScore: response.analytics?.communication?.score || 0,
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) {
      return;
    }
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) {
      return;
    }

    const sentimentCounter = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const callCompletionCounter = {
      complete: 0,
      incomplete: 0,
      partial: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    const statusCounter = {
      [CandidateStatus.NO_STATUS]: 0,
      [CandidateStatus.NOT_SELECTED]: 0,
      [CandidateStatus.POTENTIAL]: 0,
      [CandidateStatus.SELECTED]: 0,
    };

    responses.forEach((response) => {
      const sentiment = response.details?.call_analysis?.user_sentiment;
      if (sentiment === "Positive") {
        sentimentCounter.positive += 1;
      } else if (sentiment === "Negative") {
        sentimentCounter.negative += 1;
      } else if (sentiment === "Neutral") {
        sentimentCounter.neutral += 1;
      }

      const callCompletion =
        response.details?.call_analysis?.call_completion_rating;
      if (callCompletion === "Complete") {
        callCompletionCounter.complete += 1;
      } else if (callCompletion === "Incomplete") {
        callCompletionCounter.incomplete += 1;
      } else if (callCompletion === "Partial") {
        callCompletionCounter.partial += 1;
      }

      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      totalDuration += response.duration;
      if (
        Object.values(CandidateStatus).includes(
          response.candidate_status as CandidateStatus,
        )
      ) {
        statusCounter[response.candidate_status as CandidateStatus]++;
      }
    });

    setSentimentCount(sentimentCounter);
    setCallCompletion(callCompletionCounter);
    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);
    setCandidateStatusCount(statusCounter);

    const preparedData = prepareTableData(responses);
    setTableData(preparedData);
  }, [responses]);

  return (
    <div className="h-screen z-[10] mx-2">
      {responses.length > 0 ? (
        <div className="bg-slate-200 rounded-2xl min-h-[120px] p-2 ">
          <div className="flex flex-row gap-2 justify-between items-center mx-2">
            <div className="flex flex-row gap-2 items-center">
              <p className="font-semibold my-2">Overall Analysis</p>
            </div>
            <p className="text-sm">
              Interviewer used:{" "}
              <span className="font-medium">{interviewer?.name}</span>
            </p>
          </div>
          <div className="my-3 ml-2">
            <p className="text-sm">
              Interview Description:{" "}
              <span className="font-medium">{interview?.description}</span>
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm font-medium">Skills & Technologies:</p>
              <SkillsDisplay
                skills={extractSkillsFromDescription(
                  interview?.description || "",
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 my-2 mt-4 mx-2 p-4 rounded-2xl bg-slate-50 shadow-md">
            <ScrollArea className="h-[250px]">
              <DataTable data={tableData} interviewId={interview?.id || ""} />
            </ScrollArea>
          </div>
          <div className="flex flex-row gap-1 my-2 justify-center flex-wrap">
            <div className="flex flex-col">
              <div className="flex flex-col gap-1 my-2 mt-4 mx-2 p-3 rounded-2xl bg-slate-50 shadow-md max-w-[400px]">
                <div className="flex items-center gap-1 font-semibold mb-2">
                  <span className="text-[15px]">Average Duration</span>
                  <InfoTooltip content="Average time users took to complete an interview" />
                </div>
                <div className="flex items-center justify-center">
                  {renderDurationChart()}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 mx-2 p-3 rounded-2xl bg-slate-50 shadow-md max-w-[360px]">
                <div className="flex items-center gap-1 font-semibold mb-2">
                  <span className="text-[15px]">Completion Rate</span>
                  <InfoTooltip content="Percentage of interviews completed successfully" />
                </div>
                <div className="flex items-center justify-center w-full">
                  {renderCompletionChart()}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 my-2 mt-4 mx-2 p-4 rounded-2xl bg-slate-50 shadow-md">
              <div className="flex flex-row items-center justify-between gap-2 font-bold mb-3">
                <div className="flex items-center gap-2">
                  <SmileIcon />
                  <span>Candidate Sentiment</span>
                  <InfoTooltip content="Distribution of user sentiments during interviews" />
                </div>
                <Select value={sentimentChartStyle} onValueChange={setSentimentChartStyle}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pie">Pie</SelectItem>
                    <SelectItem value="donut">Donut</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="stacked">Stacked</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderSentimentChart()}
            </div>
            <div className="flex flex-col gap-1 my-2 mt-4 mx-2 p-4 rounded-2xl bg-slate-50 shadow-md">
              <div className="flex flex-row items-center justify-between gap-2 font-bold mb-3">
                <div className="flex items-center gap-2">
                  <UserCircleIcon />
                  <span>Candidate Status</span>
                  <InfoTooltip content="Breakdown of the candidate selection status" />
                </div>
                <Select value={statusChartStyle} onValueChange={setStatusChartStyle}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pie">Pie</SelectItem>
                    <SelectItem value="donut">Donut</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="stacked">Stacked</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-center mb-2">
                Total Responses: {totalResponses}
              </div>
              {renderStatusChart()}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[85%] h-[60%] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Image
              src="/No-Responses.png"
              alt="logo"
              width={270}
              height={270}
              unoptimized={true}
            />
            <p className="text-center text-sm mt-0">
              Please share with your intended respondents
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryInfo;
