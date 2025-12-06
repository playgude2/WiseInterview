"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobPostService from "@/services/jobPost.service";
import { JobPost } from "@/types/jobPost";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle, Trash2, Eye, Phone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ResumeViewerModal from "@/components/dashboard/jobs/resumeViewerModal";
import { SelectCandidatesModal } from "@/components/dashboard/initialCalls/selectCandidatesModal";
import { ConfigureCallModal } from "@/components/dashboard/initialCalls/configureCallModal";
import { CallResultsCard } from "@/components/dashboard/initialCalls/callResultsCard";
import initialCallsService from "@/services/initialCalls.service";
import { InitialCallQuestion, InitialCall } from "@/types/initialCall";

type ApplicationWithAnalysis = {
  id: string;
  created_at: string;
  job_post_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  cv_text: string;
  ats_score: number;
  ats_analysis: {
    skills_match: {
      matched_skills: string[];
      missing_skills: string[];
      match_percentage: number;
    };
    experience_fit: {
      years_of_experience: number;
      experience_match: "below" | "meets" | "exceeds";
    };
    qualification_match: {
      relevant_qualifications: string[];
      missing_qualifications: string[];
      match_percentage: number;
    };
    keyword_relevance: {
      job_specific_keywords: string[];
      missing_keywords: string[];
      relevance_score: number;
    };
    strengths: string[];
    gaps: string[];
    final_score: number;
  };
  status: string;
  shortlist_date?: string;
  is_shortlisted: boolean;
  cover_letter?: string;
  linkedin_url?: string;
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<ApplicationWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("score");
  const [filterStatus, setFilterStatus] = useState<"all" | "shortlisted" | "pending">("all");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithAnalysis | null>(null);
  const [showSelectCandidatesModal, setShowSelectCandidatesModal] = useState(false);
  const [showConfigureCallModal, setShowConfigureCallModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<ApplicationWithAnalysis[]>([]);
  const [isCreatingCalls, setIsCreatingCalls] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [initialCalls, setInitialCalls] = useState<InitialCall[]>([]);
  const [selectedCallDetail, setSelectedCallDetail] = useState<InitialCall | null>(null);
  const [showCallDetailModal, setShowCallDetailModal] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>("Your Company");

  useEffect(() => {
    const fetch = async () => {
      await fetchJobPostAndApplications();
      await fetchAgents();
      await fetchInitialCalls();
    };

    void fetch();
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAgents = async (): Promise<void> => {
    try {
      const fetchedAgents = await initialCallsService.getInitialCallAgents();
      setAgents(fetchedAgents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchInitialCalls = async (): Promise<void> => {
    try {
      const calls = await initialCallsService.getInitialCallsByJobPost(jobId);
      setInitialCalls(calls || []);
    } catch (error) {
      console.error("Error fetching initial calls:", error);
    }
  };

  const fetchJobPostAndApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      const job = await JobPostService.getJobPostById(jobId);

      if (!job) {
        toast.error("Job post not found");
        setLoading(false);

        return;
      }

      setJobPost(job);

      // Fetch organization name
      try {
        const orgResponse = await fetch("/api/get-organization", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId: job.organization_id }),
        });

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganizationName(orgData.organization?.name || "Your Company");
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        setOrganizationName("Your Company");
      }

      const response = await fetch("/api/get-job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostId: jobId }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (applicationId: string, candidateName: string, candidateEmail: string): Promise<void> => {
    try {
      const response = await fetch("/api/shortlist-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          candidateName,
          candidateEmail,
          jobTitle: jobPost?.title,
        }),
      });

      if (response.ok) {
        toast.success("Candidate shortlisted and email sent!");
        await fetchJobPostAndApplications();
      } else {
        toast.error("Failed to shortlist candidate");
      }
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      toast.error("An error occurred");
    }
  };

  const handleViewResume = (application: ApplicationWithAnalysis): void => {
    setSelectedApplication(application);
    setShowResumeModal(true);
  };

  const handleDeleteApplication = async (applicationId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      setApplications(applications.filter((a) => a.id !== applicationId));
      toast.success("Application deleted");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const handleCreateInitialCalls = (): void => {
    const shortlistedApps = applications.filter((app) => app.is_shortlisted);

    if (shortlistedApps.length === 0) {
      toast.error("No shortlisted candidates available for initial calls");

      return;
    }

    setShowSelectCandidatesModal(true);
  };

  const handleCandidatesSelected = (selected: any[]): void => {
    setSelectedCandidates(selected as ApplicationWithAnalysis[]);
    setShowSelectCandidatesModal(false);
    setShowConfigureCallModal(true);
  };

  const handleConfigureCall = async (config: {
    agentId: number;
    agentName: string;
    greetingText: string;
    callScript: InitialCallQuestion[];
    fromNumber: string;
  }): Promise<void> => {
    if (selectedCandidates.length === 0 || !jobPost) {
      toast.error("Invalid configuration");

      return;
    }

    setIsCreatingCalls(true);

    try {
      const response = await fetch("/api/create-initial-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_post_id: jobId,
          job_applications: selectedCandidates,
          agent_id: config.agentId,
          agent_name: config.agentName,
          from_number: config.fromNumber,
          user_id: jobPost.user_id,
          organization_id: jobPost.organization_id,
          job_title: jobPost.title,
          organization_name: organizationName,
          greeting_text: config.greetingText,
          call_script: config.callScript,
        }),
      });

      if (response.ok) {
        toast.success(`${selectedCandidates.length} initial call(s) created successfully!`);
        setShowConfigureCallModal(false);
        setSelectedCandidates([]);
        await fetchInitialCalls();
      } else {
        toast.error("Failed to create initial calls");
      }
    } catch (error) {
      console.error("Error creating initial calls:", error);
      toast.error("An error occurred");
    } finally {
      setIsCreatingCalls(false);
    }
  };

  const handleViewCallDetail = async (call: InitialCall): Promise<void> => {
    try {
      const response = await fetch("/api/get-initial-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initial_call_id: call.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCallDetail(data.initialCall || data.analysis);
        setShowCallDetailModal(true);
      } else {
        toast.error("Failed to load call details");
      }
    } catch (error) {
      console.error("Error fetching call detail:", error);
      toast.error("An error occurred");
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) {
      return "bg-green-100 text-green-800";
    }

    if (score >= 70) {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
  };

  const sortedAndFilteredApplications = applications
    .filter((app) => {
      if (filterStatus === "shortlisted") {
        return app.is_shortlisted;
      }

      if (filterStatus === "pending") {
        return !app.is_shortlisted;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return b.ats_score - a.ats_score;
      }

      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sortBy === "name") {
        return a.candidate_name.localeCompare(b.candidate_name);
      }

      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Link href="/dashboard/jobs">
          <Button className="mb-6" variant="ghost">
            <ArrowLeft className="mr-2" size={18} />
            Back to Jobs
          </Button>
        </Link>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800">Job Post Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link href="/dashboard/jobs">
        <Button className="mb-6" variant="ghost">
          <ArrowLeft className="mr-2" size={18} />
          Back to Jobs
        </Button>
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobPost.title}</h1>
          <p className="text-gray-600">{jobPost.description}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-gray-500 text-sm">Applications</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Shortlisted</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter((a) => a.is_shortlisted).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Location</p>
            <p className="text-lg font-semibold text-gray-900">{jobPost.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Posted</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(jobPost.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-2">
            {(jobPost.requirements as string[]).map((req: string) => (
              <li key={req} className="flex items-start gap-2 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">✓</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
          <ul className="space-y-2">
            {(jobPost.responsibilities as string[]).map((resp: string) => (
              <li key={resp} className="flex items-start gap-2 text-gray-700">
                <span className="text-indigo-600 font-bold mt-1">•</span>
                {resp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Applications</h2>

            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={applications.filter((a) => a.is_shortlisted).length === 0}
              onClick={handleCreateInitialCalls}
            >
              <Phone className="mr-2" size={18} />
              Create Initial Calls
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending Review</option>
                <option value="shortlisted">Shortlisted</option>
              </select>
            </div>

            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="score">ATS Score (High to Low)</option>
                <option value="date">Application Date (Newest)</option>
                <option value="name">Candidate Name</option>
              </select>
            </div>
          </div>
        </div>

        {sortedAndFilteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAndFilteredApplications.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{app.candidate_name}</h3>
                    <p className="text-sm text-gray-600">{app.candidate_email}</p>
                    {app.candidate_phone && (
                      <p className="text-sm text-gray-600">{app.candidate_phone}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg font-bold text-center ${getScoreColor(app.ats_score)}`}>
                      <div className="text-2xl">{Math.round(app.ats_score)}%</div>
                      <div className="text-xs">ATS Score</div>
                    </div>

                    {app.is_shortlisted && (
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        <CheckCircle size={14} />
                        Shortlisted
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 rounded bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Skills Match</p>
                    <p className="text-sm text-gray-900">
                      {app.ats_analysis?.skills_match?.match_percentage || 0}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Experience</p>
                    <p className="capitalize text-sm text-gray-900">
                      {app.ats_analysis?.experience_fit?.experience_match || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Qualifications</p>
                    <p className="text-sm text-gray-900">
                      {app.ats_analysis?.qualification_match?.match_percentage || 0}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Submitted</p>
                    <p className="text-sm text-gray-900">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.ats_analysis?.skills_match?.matched_skills?.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold text-gray-600">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {app.ats_analysis.skills_match.matched_skills.slice(0, 5).map((skill: string) => (
                        <span key={skill} className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                          {skill}
                        </span>
                      ))}
                      {app.ats_analysis.skills_match.matched_skills.length > 5 && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                          +
                          {app.ats_analysis.skills_match.matched_skills.length - 5}
                          {" "}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {app.ats_analysis?.skills_match?.missing_skills?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold text-gray-600">Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {app.ats_analysis.skills_match.missing_skills.slice(0, 5).map((skill: string) => (
                        <span key={skill} className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                          {skill}
                        </span>
                      ))}
                      {app.ats_analysis.skills_match.missing_skills.length > 5 && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                          +
                          {app.ats_analysis.skills_match.missing_skills.length - 5}
                          {" "}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!app.is_shortlisted && (
                    <Button
                      className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => handleShortlist(app.id, app.candidate_name, app.candidate_email)}
                    >
                      <Mail className="mr-2" size={16} />
                      Shortlist &amp; Notify
                    </Button>
                  )}

                  <Button
                    size="sm"
                    title="View full CV"
                    variant="secondary"
                    onClick={() => handleViewResume(app)}
                  >
                    <Eye size={16} />
                  </Button>

                  <Button
                    size="sm"
                    title="Delete application"
                    variant="destructive"
                    onClick={() => handleDeleteApplication(app.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {initialCalls.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Initial Calls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialCalls.map((call) => (
              <CallResultsCard
                key={call.id}
                call={call}
                onView={() => handleViewCallDetail(call)}
              />
            ))}
          </div>
        </div>
      )}

      {showResumeModal && selectedApplication && (
        <ResumeViewerModal
          open={showResumeModal}
          candidateName={selectedApplication.candidate_name}
          cvText={selectedApplication.cv_text}
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {showSelectCandidatesModal && (
        <SelectCandidatesModal
          isOpen={showSelectCandidatesModal}
          jobPostId={jobId}
          shortlistedCandidates={applications.filter((app) => app.is_shortlisted) as any}
          onClose={() => setShowSelectCandidatesModal(false)}
          onConfirm={handleCandidatesSelected}
        />
      )}

      {showConfigureCallModal && jobPost && agents.length > 0 && (
        <ConfigureCallModal
          isOpen={showConfigureCallModal}
          agents={agents}
          organizationName={organizationName}
          jobTitle={jobPost.title}
          onClose={() => setShowConfigureCallModal(false)}
          onConfirm={handleConfigureCall}
        />
      )}
    </div>
  );
}
