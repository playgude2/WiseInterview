"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import InterviewListItem from "@/components/dashboard/interview/interviewListItem";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { Gem, Plus, Grid3x3, List, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type ViewMode = "grid" | "list";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  function InterviewsLoader() {
    return (
      <>
        <div className="flex flex-row">
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3  mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
        </div>
      </>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses =
          await ResponseService.getResponseCountByOrganizationId(
            organization.id,
          );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) =>
      interview.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [interviews, searchQuery]);

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredInterviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInterviews, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    setItemsPerPage(viewMode === "grid" ? 12 : 10);
  }, [viewMode]);

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex items-center justify-between mt-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              My Interviews
            </h2>
            <h3 className="text-sm tracking-tight text-gray-600 font-medium mt-1">
              Start getting responses now!
            </h3>
          </div>
          <div className="flex gap-2 items-center">
            {currentPlan !== "free_trial_over" && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} />
                Create Interview
              </Button>
            )}
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 size={16} />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
              List
            </Button>
          </div>
        </div>

        <div className="mt-6 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Interviews
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per Page
            </label>
            <select
              value={itemsPerPage}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-4 mt-4">
              {interviewsLoading || loading ? (
                <InterviewsLoader />
              ) : (
                <>
                  {isModalOpen && (
                    <Modal
                      open={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                    >
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-center text-indigo-600">
                          <Gem />
                        </div>
                        <h3 className="text-xl font-semibold text-center">
                          Upgrade to Pro
                        </h3>
                        <p className="text-l text-center">
                          You have reached your limit for the free trial. Please
                          upgrade to pro to continue using our features.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-center items-center">
                            <Image
                              src={"/premium-plan-icon.png"}
                              alt="Graphic"
                              width={299}
                              height={300}
                            />
                          </div>

                          <div className="grid grid-rows-2 gap-2">
                            <div className="p-4 border rounded-lg">
                              <h4 className="text-lg font-medium">Free Plan</h4>
                              <ul className="list-disc pl-5 mt-2">
                                <li>10 Responses</li>
                                <li>Basic Support</li>
                                <li>Limited Features</li>
                              </ul>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="text-lg font-medium">Pro Plan</h4>
                              <ul className="list-disc pl-5 mt-2">
                                <li>Flexible Pay-Per-Response</li>
                                <li>Priority Support</li>
                                <li>All Features</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <p className="text-l text-center">
                          Contact{" "}
                          <span className="font-semibold">
                            founders@wise-interview.co
                          </span>{" "}
                          to upgrade your plan.
                        </p>
                      </div>
                    </Modal>
                  )}
                  {paginatedInterviews.length > 0 ? (
                    paginatedInterviews.map((item) => (
                      <InterviewCard
                        id={item.id}
                        interviewerId={item.interviewer_id}
                        key={item.id}
                        name={item.name}
                        url={item.url ?? ""}
                        readableSlug={item.readable_slug}
                        description={item.description}
                        respondents={item.respondents}
                        themeColor={item.theme_color}
                        createdAt={item.created_at}
                      />
                    ))
                  ) : (
                    <div className="col-span-4 w-full text-center py-8 text-gray-500">
                      No interviews found matching your search.
                    </div>
                  )}
                </>
              )}
            </div>

            {filteredInterviews.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            {interviewsLoading || loading ? (
              <InterviewsLoader />
            ) : (
              <>
                {isModalOpen && (
                  <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-center text-indigo-600">
                        <Gem />
                      </div>
                      <h3 className="text-xl font-semibold text-center">
                        Upgrade to Pro
                      </h3>
                      <p className="text-l text-center">
                        You have reached your limit for the free trial. Please
                        upgrade to pro to continue using our features.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-center items-center">
                          <Image
                            src={"/premium-plan-icon.png"}
                            alt="Graphic"
                            width={299}
                            height={300}
                          />
                        </div>

                        <div className="grid grid-rows-2 gap-2">
                          <div className="p-4 border rounded-lg">
                            <h4 className="text-lg font-medium">Free Plan</h4>
                            <ul className="list-disc pl-5 mt-2">
                              <li>10 Responses</li>
                              <li>Basic Support</li>
                              <li>Limited Features</li>
                            </ul>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="text-lg font-medium">Pro Plan</h4>
                            <ul className="list-disc pl-5 mt-2">
                              <li>Flexible Pay-Per-Response</li>
                              <li>Priority Support</li>
                              <li>All Features</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <p className="text-l text-center">
                        Contact{" "}
                        <span className="font-semibold">
                          founders@wise-interview.co
                        </span>{" "}
                        to upgrade your plan.
                      </p>
                    </div>
                  </Modal>
                )}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">
                    {filteredInterviews.length} Interview
                    {filteredInterviews.length !== 1 ? "s" : ""}
                    {searchQuery && ` (${paginatedInterviews.length} shown)`}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 flex-1">
                  {paginatedInterviews.length > 0 ? (
                    paginatedInterviews.map((item) => (
                      <InterviewListItem
                        id={item.id}
                        interviewerId={item.interviewer_id}
                        key={item.id}
                        name={item.name}
                        url={item.url ?? ""}
                        readableSlug={item.readable_slug}
                        description={item.description}
                        respondents={item.respondents}
                        themeColor={item.theme_color}
                        createdAt={item.created_at}
                      />
                    ))
                  ) : (
                    <div className="w-full text-center py-8 text-gray-500">
                      No interviews found matching your search.
                    </div>
                  )}
                </div>

                {filteredInterviews.length > 0 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 bg-gray-50">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <Modal
          open={isCreateModalOpen}
          closeOnOutsideClick={false}
          onClose={() => setIsCreateModalOpen(false)}
        >
          <CreateInterviewModal
            open={isCreateModalOpen}
            setOpen={setIsCreateModalOpen}
          />
        </Modal>
      )}
    </main>
  );
}

export default Interviews;
