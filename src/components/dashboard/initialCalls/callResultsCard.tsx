'use client';

import React from 'react';
import { FileText, Clock, User, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { InitialCall, CallSummaryReport } from '@/types/initialCall';

interface CallResultsCardProps {
  call: InitialCall;
  onView?: () => void;
}

export function CallResultsCard({
  call,
  onView,
}: CallResultsCardProps): React.ReactNode {
  const report = call.summary_report as CallSummaryReport;

  const getStatusColor = (
    status: string,
  ): 'green' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const colorClass = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const statusColor = getStatusColor(call.status);
  const statusBgClass = colorClass[statusColor];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {report?.candidate_name || 'Unknown Candidate'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {report?.candidate_email}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBgClass}`}
        >
          {getStatusLabel(call.status)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Job Info */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Job Position</p>
          <p className="text-sm text-gray-600">
            {report?.job_title || 'N/A'} @ {report?.organization_name || 'N/A'}
          </p>
        </div>

        {call.is_analysed && report ? (
          <>
            {/* Call Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-blue-600" />
              <span>
                Call Duration: {Math.floor((report?.call_duration || 0) / 60)}m{' '}
                {(report?.call_duration || 0) % 60}s
              </span>
            </div>

            {/* Fit Score */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Fit Score
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {report.summary.fit_score}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(report.summary.fit_score / 10) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="flex items-center gap-2">
              {report.summary.recommendation === 'yes' ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Recommended to proceed
                  </span>
                </>
              ) : report.summary.recommendation === 'maybe' ? (
                <>
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">
                    Review further
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Not recommended
                  </span>
                </>
              )}
            </div>

            {/* Strengths */}
            {report.summary.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Key Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.summary.strengths.slice(0, 3).map((strength) => (
                    <span
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                      key={strength}
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {report.summary.concerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Concerns
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.summary.concerns.slice(0, 3).map((concern) => (
                    <span
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                      key={concern}
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Level */}
            {call.candidate_responses && (
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">
                  Experience
                </p>
                <p>
                  {(call.candidate_responses as any)?.years_of_experience ||
                    'Not specified'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              {call.status === 'in_progress'
                ? 'Call in progress...'
                : 'Call analysis pending'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {call.created_at && (
            <>
              Created{' '}
              {new Date(call.created_at).toLocaleDateString()}
            </>
          )}
        </div>
        {call.is_analysed && (
          <button
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
            type="button"
            onClick={onView}
          >
            <Eye size={16} />
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
