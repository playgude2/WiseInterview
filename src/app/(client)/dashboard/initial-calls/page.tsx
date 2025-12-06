'use client';

import React, { useEffect, useState } from 'react';
import { Phone, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InitialCallsService from '@/services/initialCalls.service';
import { InitialCall } from '@/types/initialCall';
import { CallResultsCard } from '@/components/dashboard/initialCalls/callResultsCard';
import { toast } from 'sonner';

export default function InitialCallsPage() {
  const [initialCalls, setInitialCalls] = useState<InitialCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [selectedCall, setSelectedCall] = useState<InitialCall | null>(null);

  useEffect(() => {
    const fetchInitialCalls = async (): Promise<void> => {
      try {
        setLoading(true);
        // Fetch from organization or user context
        // For now, we'll fetch all calls for the current user
        // This would require adding organization_id to the service call
        // TODO: Implement proper filtering based on user organization
      } catch (error) {
        console.error('Error fetching initial calls:', error);
        toast.error('Failed to load initial calls');
      } finally {
        setLoading(false);
      }
    };

    void fetchInitialCalls();
  }, []);

  const filteredCalls = initialCalls.filter((call) => {
    if (filterStatus === 'all') {
      return true;
    }

    return call.status === filterStatus;
  });

  const pendingCount = initialCalls.filter((c) => c.status === 'pending').length;
  const completedCount = initialCalls.filter((c) => c.status === 'completed').length;
  const failedCount = initialCalls.filter((c) => c.status === 'failed').length;

  return (
    <div className="h-screen z-[10] mx-2">
      {/* Header */}
      <div className="bg-slate-200 rounded-2xl min-h-[120px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone size={32} className="text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Initial Calls</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-gray-600" />
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            type="button"
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            type="button"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            type="button"
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'failed'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            type="button"
            onClick={() => setFilterStatus('failed')}
          >
            Failed
          </button>
        </div>

        {/* Calls Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Phone className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              {initialCalls.length === 0 ? 'No initial calls yet' : 'No calls match your filter'}
            </h3>
            <p className="text-gray-600">
              {initialCalls.length === 0
                ? 'Create initial calls by selecting shortlisted candidates from job posts'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalls.map((call) => (
              <CallResultsCard
                key={call.id}
                call={call}
                onView={() => setSelectedCall(call)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Call Details - {selectedCall.summary_report?.candidate_name}
            </h2>

            {selectedCall.is_analysed && selectedCall.summary_report ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Candidate Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedCall.summary_report.candidate_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job Title</p>
                    <p className="font-medium text-gray-900">
                      {selectedCall.summary_report.job_title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium text-gray-900">
                      {selectedCall.summary_report.organization_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Call Duration</p>
                    <p className="font-medium text-gray-900">
                      {Math.floor(selectedCall.summary_report.call_duration / 60)}m{' '}
                      {selectedCall.summary_report.call_duration % 60}s
                    </p>
                  </div>
                </div>

                {/* Fit Score */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Fit Score</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {selectedCall.summary_report.summary.fit_score}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(selectedCall.summary_report.summary.fit_score / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Responses */}
                {selectedCall.candidate_responses && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Candidate Responses</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCall.candidate_responses as Record<string, any>).map(
                        ([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">{String(value)}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recommendation</p>
                  <p className="text-lg font-semibold mb-3">
                    {selectedCall.summary_report.summary.recommendation === 'yes'
                      ? '✅ Proceed with next stage'
                      : selectedCall.summary_report.summary.recommendation === 'maybe'
                        ? '⚠️ Review further'
                        : '❌ Not recommended'}
                  </p>
                </div>

                {/* Strengths & Concerns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                    <ul className="space-y-2">
                      {selectedCall.summary_report.summary.strengths.map((strength) => (
                        <li key={strength} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Concerns</h4>
                    <ul className="space-y-2">
                      {selectedCall.summary_report.summary.concerns.map((concern) => (
                        <li key={concern} className="text-sm text-gray-600 flex items-start">
                          <span className="text-red-600 mr-2">⚠</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600">Call analysis pending...</p>
            )}

            <button
              className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
              type="button"
              onClick={() => setSelectedCall(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
