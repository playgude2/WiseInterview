"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import JobPostService from "@/services/jobPost.service";
import { ClientService } from "@/services/clients.service";
import { JobPost } from "@/types/jobPost";
import ApplyModal from "@/components/jobs/applyModal";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  logo_url?: string;
};

export default function JobPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobPost();
  }, [slug]);

  const fetchJobPost = async () => {
    try {
      setLoading(true);
      const post = await JobPostService.getJobPostBySlug(slug);
      if (post) {
        // Increment view count
        await JobPostService.incrementViewCount(post.id);
        setJobPost(post);

        // Fetch organization info
        const org = await ClientService.getOrganizationById(post.organization_id);
        if (org && org.length === 0) {
          setOrganization(null);
        } else if (org) {
          setOrganization(org);
        }
      }
    } catch (error) {
      console.error("Error fetching job post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Job Post Not Found
          </h1>
          <p className="text-gray-600">
            The job posting you&apos;re looking for doesn&apos;t exist or has been archived.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a
            href="/careers"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to All Jobs
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 flex-grow">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Organization Info */}
          {organization && (
            <div className="mb-6 pb-6 border-b border-gray-200 flex items-center gap-3">
              {organization.logo_url && (
                <Image
                  src={organization.logo_url}
                  alt={organization.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain bg-gray-50 p-1"
                />
              )}
              <div>
                <p className="text-sm text-gray-600 font-medium">Hiring Company</p>
                <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {jobPost.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 mb-6">
              {jobPost.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="text-indigo-600" size={20} />
                  <span className="text-gray-700">{jobPost.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} />
                <span className="text-gray-700">
                  {jobPost.employment_type === "full-time"
                    ? "Full-time"
                    : jobPost.employment_type === "part-time"
                      ? "Part-time"
                      : "Contract"}
                </span>
              </div>
              {jobPost.salary_range && (
                <div className="flex items-center gap-2">
                  <Briefcase className="text-indigo-600" size={20} />
                  <span className="text-gray-700">{jobPost.salary_range}</span>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <Button
              className="bg-indigo-600 hover:bg-indigo-800 text-white px-8 py-3 text-lg"
              onClick={() => setShowApplyModal(true)}
            >
              Apply Now
            </Button>
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About This Role
            </h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {jobPost.description}
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What We&apos;re Looking For
            </h2>
            <ul className="space-y-3">
              {jobPost.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Key Responsibilities
            </h2>
            <ul className="space-y-3">
              {jobPost.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-indigo-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="border-t pt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Ready to Apply?
              </h3>
              <Button
                className="bg-indigo-600 hover:bg-indigo-800 text-white px-8 py-3 text-lg"
                onClick={() => setShowApplyModal(true)}
              >
                Submit Your Application
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            Powered by{" "}
            <span className="font-bold">
              Wise<span className="text-indigo-600">Interview</span>
            </span>
          </p>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          jobPostId={jobPost.id}
          jobTitle={jobPost.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={async () => {
            // Refresh job post to update application count
            await fetchJobPost();
          }}
        />
      )}
    </div>
  );
}
