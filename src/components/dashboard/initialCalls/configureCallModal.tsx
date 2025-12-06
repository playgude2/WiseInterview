'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { InitialCallAgent, InitialCallQuestion } from '@/types/initialCall';

interface ConfigureCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    agentId: number;
    agentName: string;
    greetingText: string;
    callScript: InitialCallQuestion[];
    fromNumber: string;
  }) => void;
  agents: InitialCallAgent[];
  organizationName: string;
  jobTitle: string;
}

const DEFAULT_QUESTIONS: InitialCallQuestion[] = [
  {
    id: 'q1',
    question: 'Do you have experience in this field? What technologies are you working with?',
    category: 'experience',
    order: 1,
  },
  {
    id: 'q2',
    question: 'What is your years of experience in this domain?',
    category: 'experience',
    order: 2,
  },
  {
    id: 'q3',
    question: 'What is the best time to schedule an interview this week?',
    category: 'availability',
    order: 3,
  },
  {
    id: 'q4',
    question: 'What is your current availability?',
    category: 'availability',
    order: 4,
  },
  {
    id: 'q5',
    question: 'What is your current salary?',
    category: 'salary',
    order: 5,
  },
  {
    id: 'q6',
    question: 'What is your last working day?',
    category: 'salary',
    order: 6,
  },
  {
    id: 'q7',
    question: 'Are you currently on a notice period?',
    category: 'general',
    order: 7,
  },
  {
    id: 'q8',
    question: 'What are your salary expectations?',
    category: 'salary',
    order: 8,
  },
  {
    id: 'q9',
    question: 'Are you comfortable with relocation?',
    category: 'relocation',
    order: 9,
  },
  {
    id: 'q10',
    question: 'Can you work 3 days a week from office or do you prefer full office/remote?',
    category: 'relocation',
    order: 10,
  },
];

export function ConfigureCallModal({
  isOpen,
  onClose,
  onConfirm,
  agents,
  organizationName,
  jobTitle,
}: ConfigureCallModalProps): React.ReactNode {
  const [selectedAgent, setSelectedAgent] = useState<InitialCallAgent | null>(
    agents[0] || null,
  );
  const [greetingText, setGreetingText] = useState(
    `Hello {{candidate_name}}, this is a call from {{organization_name}} and my name is {{agent_name}}. Is it a great time to talk about the {{job_title}} position?`,
  );
  const [questions, setQuestions] = useState<InitialCallQuestion[]>(
    DEFAULT_QUESTIONS,
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [fromNumber, setFromNumber] = useState('+12024280523');

  if (!isOpen) {
    return null;
  }

  const handleAddQuestion = (): void => {
    if (newQuestion.trim()) {
      const newQ: InitialCallQuestion = {
        id: `q${questions.length + 1}`,
        question: newQuestion,
        category: 'general',
        order: questions.length + 1,
      };

      setQuestions([...questions, newQ]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (id: string): void => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (
    id: string,
    field: keyof InitialCallQuestion,
    value: any,
  ): void => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q,
      ),
    );
  };

  const handleConfirm = (): void => {
    if (!selectedAgent) {
      alert('Please select an agent');

      return;
    }

    if (!fromNumber.trim()) {
      alert('Please enter a Twilio phone number');

      return;
    }

    onConfirm({
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      greetingText,
      callScript: questions,
      fromNumber,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Configure Initial Call
            </h2>
            <p className="text-gray-600 mt-1">
              Setup call agent, greeting, and questions for {jobTitle}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Call Agent
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedAgent?.id || ''}
              onChange={(e) => {
                const agent = agents.find((a) => a.id === parseInt(e.target.value));
                setSelectedAgent(agent || null);
              }}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {selectedAgent?.description && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedAgent.description}
              </p>
            )}
          </div>

          {/* Twilio Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Number (Twilio)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. +12024280523"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Twilio phone number that will be displayed as the caller ID
            </p>
          </div>

          {/* Greeting Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Greeting Script
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the greeting script..."
              rows={4}
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{candidate_name}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{agent_name}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{organization_name}}'}</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{job_title}}'}</code> as placeholders
            </p>

            {/* Preview */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                Preview (Example for candidate &quot;Pranav&quot;):
              </p>
              <p className="text-sm text-blue-800 italic">
                {greetingText
                  .replace(/\{\{candidate_name\}\}/g, 'Pranav')
                  .replace(/\{\{agent_name\}\}/g, selectedAgent?.name || 'Agent')
                  .replace(/\{\{organization_name\}\}/g, organizationName)
                  .replace(/\{\{job_title\}\}/g, jobTitle)}
              </p>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Call Questions
            </h3>

            {/* Add New Question */}
            <div className="mb-4 flex gap-2">
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a new question..."
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddQuestion();
                  }
                }}
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                type="button"
                onClick={handleAddQuestion}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-sm font-medium text-gray-500 pt-2">
                      Q{index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={question.question}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            question.id,
                            'question',
                            e.target.value,
                          )
                        }
                      />
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={question.category}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            question.id,
                            'category',
                            e.target.value as any,
                          )
                        }
                      >
                        <option value="experience">Experience</option>
                        <option value="availability">Availability</option>
                        <option value="salary">Salary</option>
                        <option value="relocation">Relocation</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <button
                      className="text-red-600 hover:text-red-700 transition pt-2"
                      type="button"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            type="button"
            onClick={handleConfirm}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
