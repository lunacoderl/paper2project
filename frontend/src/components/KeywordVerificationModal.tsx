"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Tag,
  Cpu,
  Layers,
  Wrench,
  Database,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export interface ExtractedKeywords {
  project_title: string;
  algorithms: string[];
  techniques: string[];
  methods: string[];
  functions: string[];
  tools: string[];
  datasets: string[];
  domains: string[];
}

interface KeywordVerificationModalProps {
  isOpen: boolean;
  initialKeywords: ExtractedKeywords;
  onConfirm: (verifiedKeywords: ExtractedKeywords) => void;
  onCancel: () => void;
}

export function KeywordVerificationModal({
  isOpen,
  initialKeywords,
  onConfirm,
  onCancel,
}: KeywordVerificationModalProps) {
  const [keywords, setKeywords] = useState<ExtractedKeywords>(initialKeywords);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [targetCategory, setTargetCategory] = useState<keyof ExtractedKeywords>("algorithms");

  if (!isOpen) return null;

  const handleRemove = (category: keyof ExtractedKeywords, index: number) => {
    setKeywords((prev) => {
      const arr = [...(prev[category] as string[])];
      arr.splice(index, 1);
      return { ...prev, [category]: arr };
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeywordInput.trim();
    if (!trimmed) return;

    setKeywords((prev) => {
      const current = prev[targetCategory] as string[];
      if (!current.includes(trimmed)) {
        return { ...prev, [targetCategory]: [...current, trimmed] };
      }
      return prev;
    });

    setNewKeywordInput("");
  };

  const categories: { key: keyof ExtractedKeywords; label: string; icon: any; color: string }[] = [
    { key: "algorithms", label: "Algorithms", icon: Cpu, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "techniques", label: "Techniques", icon: Layers, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { key: "methods", label: "Methods", icon: SlidersHorizontal, color: "bg-amber-50 text-amber-800 border-amber-200" },
    { key: "functions", label: "Functions & Operations", icon: Tag, color: "bg-teal-50 text-teal-700 border-teal-200" },
    { key: "tools", label: "Tools & Libraries", icon: Wrench, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { key: "datasets", label: "Datasets & Benchmarks", icon: Database, color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 2: Pre-Retrieval Verification</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Verify Research Entities & Search Basis
            </h2>
            <p className="text-xs text-slate-500">
              Before querying 200M+ research papers, verify the exact technical keywords extracted from your source. Papers will be gathered based on these entities.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Title Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Project Concept Title</div>
            <div className="text-sm font-extrabold text-slate-900">{keywords.project_title}</div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
            {keywords.domains[0] || "General AI"}
          </span>
        </div>

        {/* Categorized Badges Section */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const items = (keywords[cat.key] as string[]) || [];
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat.label} ({items.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTargetCategory(cat.key)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add to {cat.label}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-50/70 border border-slate-200">
                  {items.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No {cat.label.toLowerCase()} specified yet.</span>
                  ) : (
                    items.map((item, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs ${cat.color}`}
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(cat.key, idx)}
                          className="hover:opacity-100 opacity-60 ml-0.5"
                          title="Remove keyword"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Keyword Quick Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex-1 flex items-center rounded-xl border border-slate-200 px-3 py-1.5 focus-within:border-indigo-500 bg-white">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={`Add custom keyword to ${targetCategory}...`}
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              className="w-full text-xs outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 outline-none font-medium"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Back & Edit Source
          </button>

          <button
            type="button"
            onClick={() => onConfirm(keywords)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Keywords & Retrieve Similar Papers &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
