"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import JobPostService from "@/services/jobPost.service";
import { ClientService } from "@/services/clients.service";
import { JobPost } from "@/types/jobPost";
import Link from "next/link";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Organization = {
  id: string;
  name: string;
  logo_url?: string;
};

export default function CareersPage() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobPostsAndOrganization();
  }, []);

  const fetchJobPostsAndOrganization = async () => {
    try {
      setLoading(true);
      const posts = await JobPostService.getPublicJobPosts();
      setJobPosts(posts);

      // Fetch organization info from the first job post if available
      if (posts.length > 0) {
        const org = await ClientService.getOrganizationById(posts[0].organization_id);
        if (org && org.length === 0) {
          // Fallback if no org found
          setOrganization(null);
        } else if (org) {
          setOrganization(org);
        }
      }
    } catch (error) {
      console.error("Error fetching job posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobPosts.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesFilter =
      selectedFilter === "all" ||
      selectedFilter === job.employment_type;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex-grow">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          {/* Organization Info */}
          {organization && (
            <div className="mb-8 flex items-center gap-3">
              {organization.logo_url && (
                <Image
                  src={organization.logo_url}
                  alt={organization.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain bg-white p-1"
                />
              )}
              <div>
                <p className="text-indigo-100 text-sm font-medium">We are hiring at</p>
                <h2 className="text-2xl font-bold text-white">{organization.name}</h2>
              </div>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Join Our Growing Team
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mb-8 leading-relaxed">
            We&apos;re building the future of AI-powered interviews. Explore exciting opportunities to make an impact and grow your career with us.
          </p>
          <div className="flex gap-4">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Explore Positions
            </Button>
            <Button className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-3 text-lg font-semibold">
              Learn About Us
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search Positions
              </label>
              <input
                type="text"
                placeholder="Search by job title, description, or location..."
                value={searchTerm}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Type
              </label>
              <div className="flex gap-3 flex-wrap">
                {["all", "full-time", "part-time", "contract"].map((filter) => (
                  <button
                    key={filter}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      selectedFilter === filter
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter === "all"
                      ? "All Positions"
                      : filter === "full-time"
                        ? "Full-time"
                        : filter === "part-time"
                          ? "Part-time"
                          : "Contract"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No positions available
            </h3>
            <p className="text-gray-600 text-lg">
              Try adjusting your search or check back soon
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.readable_slug}`}
                className="group block"
              >
                <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-indigo-600 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-start gap-6 mb-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3">
                        {job.title}
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                        {job.employment_type === "full-time"
                          ? "Full-time"
                          : job.employment_type === "part-time"
                            ? "Part-time"
                            : "Contract"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-6 border-t border-gray-200">
                    {job.location && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <MapPin size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Location</p>
                          <p className="text-gray-900 font-semibold">{job.location}</p>
                        </div>
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Briefcase size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Salary</p>
                          <p className="text-gray-900 font-semibold">{job.salary_range}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Applications</p>
                        <p className="text-gray-900 font-semibold">
                          {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 font-semibold">
                      View Details & Apply →
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!loading && filteredJobs.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Didn&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Check back soon for more exciting opportunities or reach out to our team
            </p>
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Contact Careers Team
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            Powered by{" "}
            <span className="font-bold">
              Wise<span className="text-indigo-600">Interview</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
