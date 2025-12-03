"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/dashboard/Modal";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import axios from "axios";

interface ShareInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewLink: string;
  interviewName: string;
}

function ShareInterviewModal({
  isOpen,
  onClose,
  interviewLink,
  interviewName,
}: ShareInterviewModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!name.trim()) {
      toast.error("Please enter candidate name");

      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");

      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/send-interview-email", {
        candidateName: name,
        candidateEmail: email,
        interviewLink,
        interviewName,
      });

      toast.success("Interview link sent successfully!");
      setName("");
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="space-y-5 w-96">
        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Share Interview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Send the interview link to a candidate via email
          </p>
        </div>

        {/* Interview Name Display */}
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-xs font-medium text-indigo-600">Interview</p>
          <p className="text-sm text-gray-900 font-semibold truncate">
            {interviewName}
          </p>
        </div>

        {/* Candidate Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Candidate Name
          </label>
          <input
            type="text"
            placeholder="e.g., John Doe"
            value={name}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g., john@example.com"
            value={email}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>

        {/* Interview Link Display */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Interview Link
          </p>
          <p className="text-xs text-gray-700 break-all font-mono">
            {interviewLink}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            disabled={isLoading}
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            onClick={handleShare}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={16} />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ShareInterviewModal;
