"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Check,
  Copy,
  X,
  Zap,
  CheckCircle2,
  Code2,
  DollarSign,
  Cpu,
  Layers,
  Compass,
  Lightbulb,
  Milestone,
  RotateCcw,
  BookOpen,
  Download,
  Share2,
  Terminal,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateCopilotResponse } from "@/lib/demo-engine";

type CopilotMode = "all" | "literature" | "advantage" | "budget" | "code";

export default function CopilotPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, addCopilotMessage, hydrateStore } = useAppStore();

  const [project, setProject] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<CopilotMode>("all");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [transcriptCopied, setTranscriptCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    const p = getProjectById(projectId) || projects[0];
    if (p) {
      setProject(p);
      if (p.copilotMessages && p.copilotMessages.length > 0) {
        setMessages(
          p.copilotMessages.map((m: any) => ({
            id: m.id,
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
            timestamp: m.timestamp,
          }))
        );
      } else {
        const welcome = {
          id: "welcome-1",
          role: "assistant",
          content: `### 👋 Welcome to your Project Copilot!\n\nI am your dedicated AI software architect for **${p.title}**.\n\nI have loaded your complete project blueprint:\n- **Literature Overlap**: ${p.implementationAssessment?.overallImplementedScore || 65}% prior art match\n- **Novel Advantage Score**: ${p.implementationAssessment?.noveltyScore || 35}% greenfield\n- **Budget Tier**: ${p.roadmap?.budgetBreakdown?.tier || "$0 Zero-Cost"}\n\nSelect a topic below or ask anything to start architecting!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([welcome]);
      }
    }
  }, [projectId, projects, getProjectById]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const modePrompts: Record<CopilotMode, { label: string; icon: any; prompts: string[] }> = {
    all: {
      label: "All-Round Architect",
      icon: Sparkles,
      prompts: [
        "How much of this project is already implemented in research papers?",
        "Generate the core Python pipeline boilerplate code",
        "How can I build and deploy this project for $0 cost?",
        "What equipment and hardware do I need to run this?",
      ],
    },
    literature: {
      label: "Literature & Prior Art",
      icon: BookOpen,
      prompts: [
        "Which specific features of my idea already exist in published papers?",
        "Who are the top academic competitors and benchmark baselines?",
        "What evaluation metrics do papers in this domain use?",
      ],
    },
    advantage: {
      label: "Competitive Edge",
      icon: Lightbulb,
      prompts: [
        "How can I make this project 10x more advantageous than prior work?",
        "What architectural gaps in existing papers can I exploit?",
        "Suggest a novel hybrid approach to beat baseline latency",
      ],
    },
    budget: {
      label: "$0 Budget & Setup",
      icon: DollarSign,
      prompts: [
        "How can I run and host this 100% free without entering a credit card?",
        "What are the best free cloud GPU options (Colab vs Kaggle)?",
        "How do I set up local development on a standard laptop?",
      ],
    },
    code: {
      label: "Code & APIs",
      icon: Code2,
      prompts: [
        "Generate the FastAPI REST inference endpoint with typed schemas",
        "Show me how to quantize the model to INT8 ONNX",
        "Generate a client-side TypeScript API wrapper",
      ],
    },
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: timeNow };

    setMessages((prev) => [...prev, userMsg]);
    addCopilotMessage(projectId, { sender: "user", text });
    if (!textToSend) setInput("");
    setLoading(true);

    setTimeout(() => {
      if (project?.analysis) {
        const answer = generateCopilotResponse(
          text,
          project.analysis,
          project.implementationAssessment,
          project.roadmap
        );

        const assistantMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        addCopilotMessage(projectId, { sender: "copilot", text: answer });
      }
      setLoading(false);
    }, 600);
  };

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyTranscript = () => {
    const text = messages
      .map((m) => `### ${m.role === "user" ? "User" : "Copilot"} (${m.timestamp || ""})\n\n${m.content}\n\n---`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setTranscriptCopied(true);
    setTimeout(() => setTranscriptCopied(false), 2500);
  };

  const handleClearChat = () => {
    if (confirm("Clear current conversation history?")) {
      const welcome = {
        id: "welcome-fresh",
        role: "assistant",
        content: `Conversation cleared. I am ready with full project context for **${project?.title || "your project"}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcome]);
    }
  };

  // Helper to render message content with code blocks and styling
  const renderMessageContent = (content: string, msgId: string) => {
    // Check if message contains code block ```
    if (content.includes("```")) {
      const parts = content.split("```");
      return (
        <div className="space-y-3">
          {parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              // Code block
              const lines = part.trim().split("\n");
              const language = lines[0]?.trim() || "code";
              const codeBody = lines.slice(1).join("\n") || part;
              const codeBlockId = `${msgId}-code-${pIdx}`;

              return (
                <div
                  key={pIdx}
                  className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] text-slate-100 shadow-sm text-xs font-mono my-2"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider">{language}</span>
                    <button
                      onClick={() => handleCopyCode(codeBody, codeBlockId)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      {copiedCodeId === codeBlockId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-slate-200">
                    <code>{codeBody}</code>
                  </pre>
                </div>
              );
            }

            // Normal text
            return (
              <div key={pIdx} className="space-y-1.5 leading-relaxed font-normal">
                {part.split("\n").map((line, lIdx) => {
                  if (line.startsWith("### ")) {
                    return (
                      <h4 key={lIdx} className="font-extrabold text-sm sm:text-base text-slate-900 pt-1 pb-0.5">
                        {line.replace("### ", "")}
                      </h4>
                    );
                  }
                  if (line.startsWith("- **")) {
                    const subParts = line.split("**");
                    return (
                      <div key={lIdx} className="pl-3 py-0.5 text-slate-700 flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>
                          <strong className="text-slate-900">{subParts[1]}</strong>
                          {subParts[2]}
                        </span>
                      </div>
                    );
                  }
                  return <p key={lIdx} className="min-h-[1.2em]">{line}</p>;
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // Standard markdown without code blocks
    return (
      <div className="space-y-1.5 leading-relaxed font-normal">
        {content.split("\n").map((line: string, lIdx: number) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={lIdx} className="font-extrabold text-sm sm:text-base text-slate-900 pt-1 pb-0.5">
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("- **")) {
            const parts = line.split("**");
            return (
              <div key={lIdx} className="pl-3 py-0.5 text-slate-700 flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  <strong className="text-slate-900">{parts[1]}</strong>
                  {parts[2]}
                </span>
              </div>
            );
          }
          return <p key={lIdx} className="min-h-[1.2em]">{line}</p>;
        })}
      </div>
    );
  };

  const overlap = project?.implementationAssessment?.overallImplementedScore || 68;
  const novelty = project?.implementationAssessment?.noveltyScore || 32;

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                Copilot AI Architect
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Context
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Grounded on <strong>{project?.title || "Active Project"}</strong> • 200M+ Academic Papers
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition-colors"
          >
            {transcriptCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Transcript Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Chat</span>
              </>
            )}
          </button>
          <button
            onClick={handleClearChat}
            title="Reset Chat"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Body */}
      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left Sidebar: Project Radar & Persona Modes (Hidden on small screens) */}
        <div className="hidden lg:flex w-72 flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs shrink-0 overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Project Context Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-indigo-700">Project Blueprint</span>
                <Link
                  href={`/projects/${projectId}`}
                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <h3 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                {project?.title || "Research Project"}
              </h3>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-indigo-800 border border-indigo-200 shadow-2xs">
                🏷️ {project?.analysis?.domains?.[0] || "Software AI"}
              </span>

              {/* Overlap vs Novelty Mini Bar */}
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Overlap: {overlap}%</span>
                  <span className="text-emerald-700">{novelty}% Novel</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${overlap}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Persona Modes */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-1">Copilot Specializations</div>
              {(Object.keys(modePrompts) as CopilotMode[]).map((mode) => {
                const item = modePrompts[mode];
                const Icon = item.icon;
                const isActive = activeMode === mode;

                return (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts Box */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Grounded Knowledge</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
              Responses reference your extracted features, Semantic Scholar search results, and $0 roadmap.
            </p>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isUser
                        ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white"
                        : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm shadow-xs ${
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white rounded-tr-xs"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    {renderMessageContent(msg.content, msg.id)}

                    {msg.timestamp && (
                      <div
                        className={`text-[10px] font-mono text-right pt-2 ${
                          isUser ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5 text-xs font-bold text-slate-600">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Synthesizing answer from project context & academic benchmarks...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Suggestions & Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            {/* Filtered Mode Prompts Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Suggestions:</span>
              {modePrompts[activeMode].prompts.map((pText) => (
                <button
                  key={pText}
                  type="button"
                  onClick={() => handleSend(pText)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 shadow-2xs transition-colors shrink-0 text-left"
                >
                  💡 {pText}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask anything about ${project?.title || "your project"}... (e.g. "Generate Python code", "How much is implemented?")`}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs transition-colors font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-xs transition-all disabled:opacity-40 hover:scale-[1.02] flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
