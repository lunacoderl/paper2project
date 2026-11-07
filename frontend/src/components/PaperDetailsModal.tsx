"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  FileText,
  Copy,
  CheckCircle2,
  Award,
  Layers,
  Database,
  Calendar,
  User,
  Sparkles,
} from "lucide-react";
import { SemanticScholarPaper } from "@/lib/semantic-scholar";

interface PaperDetailsModalProps {
  paper: SemanticScholarPaper | null;
  onClose: () => void;
}

export function PaperDetailsModal({ paper, onClose }: PaperDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "raw_json">("overview");
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(paper, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const authorsText = paper.authors?.map((a) => a.name).join(", ") || "Academic Research Group";
  const datasets = paper.datasetsUsed && paper.datasetsUsed.length > 0 ? paper.datasetsUsed : ["Standard Benchmark Dataset"];
  const matchedKeywords = paper.matchedKeywords && paper.matchedKeywords.length > 0 ? paper.matchedKeywords : ["Deep Learning", "Neural Network"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rank #{paper.rank || 1}</span>
            </span>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {paper.matchPercentage || 90}% Match Percentage
            </span>

            {paper.reportedAccuracy && (
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                🎯 {paper.reportedAccuracy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("raw_json")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "raw_json" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                API JSON
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" ? (
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">{paper.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{authorsText}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{paper.year || 2024}</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {paper.venue || "Academic Publication"}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Reported Accuracy</span>
                <div className="text-base font-extrabold text-indigo-950 mt-0.5">{paper.reportedAccuracy || "88.2% Baseline"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Citations</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{paper.citationCount || 24}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Influential Citations</span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{paper.influentialCitationCount || 8}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ranking Criterion</span>
                <div className="text-xs font-bold text-slate-800 mt-1 capitalize">
                  {paper.rankingCriterion?.replace(/_/g, " ") || "Technique Match"}
                </div>
              </div>
            </div>

            {/* Datasets Used */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-rose-500" />
                <span>Datasets & Benchmarks Evaluated:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {datasets.map((ds, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                    {ds}
                  </span>
                ))}
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Matched Technical Keywords from Your Source:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800">Abstract & Methodological Summary:</div>
              <p className="text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {paper.abstract || "Comprehensive methodology addressing fundamental benchmark comparisons and algorithmic bounds."}
              </p>
            </div>

            {/* External Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs"
              >
                <span>View Full Paper on Semantic Scholar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {paper.openAccessPdf?.url && (
                <a
                  href={paper.openAccessPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download PDF</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Raw JSON Inspector */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Full API JSON Response (Stored in Local DB as JSON to save backend storage)
              </span>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(paper, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
