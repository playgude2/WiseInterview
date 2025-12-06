'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { JobApplication } from '@/types/jobPost';

interface SelectCandidatesModalProps {
  isOpen: boolean;
  jobPostId: string;
  onClose: () => void;
  onConfirm: (selectedCandidates: JobApplication[]) => void;
  shortlistedCandidates: JobApplication[];
}

export function SelectCandidatesModal({
  isOpen,
  onClose,
  onConfirm,
  shortlistedCandidates,
}: SelectCandidatesModalProps): React.ReactNode {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) {
    return null;
  }

  const filteredCandidates = shortlistedCandidates.filter(
    (candidate) =>
      candidate.candidate_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidate.candidate_email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleToggleCandidate = (candidateId: string): void => {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }

    setSelectedIds(newSelected);
  };

  const handleSelectAll = (): void => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(filteredCandidates.map((c) => c.id)),
      );
    }
  };

  const handleConfirm = (): void => {
    const selected = shortlistedCandidates.filter((c) =>
      selectedIds.has(c.id),
    );

    onConfirm(selected);
    setSelectedIds(new Set());
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select Candidates for Initial Calls
            </h2>
            <p className="text-gray-600 mt-1">
              Choose shortlisted candidates to create initial screening calls
            </p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 transition"
            type="button"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name or email..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Select All */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                checked={
                  filteredCandidates.length > 0 &&
                  selectedIds.size === filteredCandidates.length
                }
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                type="checkbox"
                onChange={handleSelectAll}
              />
              <span className="ml-3 font-medium text-gray-700">
                {selectedIds.size === 0
                  ? 'Select All'
                  : `${selectedIds.size} Selected`}
              </span>
            </label>
          </div>

          {/* Candidates List */}
          <div className="space-y-2">
            {filteredCandidates.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No shortlisted candidates found
              </p>
            ) : (
              filteredCandidates.map((candidate) => (
                <label
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  key={candidate.id}
                >
                  <input
                    checked={selectedIds.has(candidate.id)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    type="checkbox"
                    onChange={() => handleToggleCandidate(candidate.id)}
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-900">
                      {candidate.candidate_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {candidate.candidate_email}
                    </p>
                    {candidate.ats_score && (
                      <p className="text-sm text-blue-600 mt-1">
                        ATS Score: {Math.round(Number(candidate.ats_score))}%
                      </p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedIds.size === 0}
            type="button"
            onClick={handleConfirm}
          >
            Create Initial Calls ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}
