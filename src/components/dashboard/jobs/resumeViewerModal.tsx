"use client";

import React, { useState } from "react";
import Modal from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface ResumeViewerModalProps {
  open: boolean;
  candidateName: string;
  cvText: string;
  onClose: () => void;
}

export default function ResumeViewerModal({
  open,
  candidateName,
  cvText,
  onClose,
}: ResumeViewerModalProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([cvText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${candidateName.replace(/\s+/g, "_")}_resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      closeOnOutsideClick={true}
      open={open}
      onClose={onClose}
    >
      <div className="w-[80vw] max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resume</h2>
            <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm">
              {cvText || "No resume content available"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-white flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            onClick={handleDownload}
          >
            <Download size={18} />
            Download as Text
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
