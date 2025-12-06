"use client";

import React, { useState } from "react";
import { useJobPosts } from "@/contexts/jobPost.context";
import Modal from "@/components/dashboard/Modal";
import CreateJobPostModal from "@/components/dashboard/jobs/createJobPostModal";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Archive, Trash2 } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const { jobPosts, isLoading, archiveJobPost, deleteJobPost } = useJobPosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeJobs = jobPosts.filter((job) => !job.is_archived);
  const archivedJobs = jobPosts.filter((job) => job.is_archived);

  const handleArchive = async (jobId: string): Promise<void> => {
    if (confirm("Are you sure you want to archive this job post?")) {
      await archiveJobPost(jobId);
    }
  };

  const handleDelete = async (jobId: string): Promise<void> => {
    if (
      confirm(
        "Are you sure you want to delete this job post? This action cannot be undone.",
      )
    ) {
      await deleteJobPost(jobId);
    }
  };

  function JobPostCard({
    archived = false,
    job,
  }: {
    archived?: boolean;
    job: (typeof jobPosts)[0];
  }): React.ReactNode {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {job.description}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
              archived ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"
            }`}
          >
            {archived ? "Archived" : "Active"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-sm">Employment Type</p>
            <p className="text-gray-900 font-medium">
              {job.employment_type === "full-time"
                ? "Full-time"
                : job.employment_type === "part-time"
                  ? "Part-time"
                  : "Contract"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Applications</p>
            <p className="text-gray-900 font-medium">{job.application_count}</p>
          </div>
          {job.location && (
            <div>
              <p className="text-gray-500 text-sm">Location</p>
              <p className="text-gray-900 font-medium">{job.location}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 text-sm">Posted</p>
            <p className="text-gray-900 font-medium">
              {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link className="flex-1" href={`/dashboard/jobs/${job.id}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" variant="default">
              View &amp; Manage
            </Button>
          </Link>
          {!archived && (
            <Button
              className=""
              size="sm"
              title="Archive this job post"
              variant="secondary"
              onClick={() => handleArchive(job.id)}
            >
              <Archive size={18} />
            </Button>
          )}
          <Button
            size="sm"
            title="Delete this job post"
            variant="destructive"
            onClick={() => handleDelete(job.id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen z-[10] mx-2">
      <div className="bg-slate-200 rounded-2xl min-h-[120px] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Briefcase size={32} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Job Posts</h1>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-800"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} className="mr-2" />
            Create New Job
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : jobPosts.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              No job posts yet
            </h3>
            <p className="mb-6 text-gray-600">
              Start by creating your first job post to attract talent
            </p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-800"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2" size={20} />
              Create Job Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeJobs.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Active Jobs (
                  {activeJobs.length}
                  )
                </h2>
                <div className="grid gap-4">
                  {activeJobs.map((job) => (
                    <React.Fragment key={job.id}>
                      {JobPostCard({ archived: false, job })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {archivedJobs.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Archived Jobs (
                  {archivedJobs.length}
                  )
                </h2>
                <div className="grid gap-4">
                  {archivedJobs.map((job) => (
                    <React.Fragment key={job.id}>
                      {JobPostCard({ archived: true, job })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <Modal closeOnOutsideClick={false} open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
          <CreateJobPostModal onClose={() => setIsCreateModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
