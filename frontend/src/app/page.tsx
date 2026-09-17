"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Search,
  Lightbulb,
  Milestone,
  Network,
  Bot,
  Layers,
  CheckCircle2,
  Zap,
  DollarSign,
  Cpu,
  BarChart3,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Colorful Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-indigo-200/40 via-purple-100/30 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[500px] right-0 w-[600px] h-[600px] bg-sky-200/30 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-pink-200/25 blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center border border-slate-200 bg-white p-1 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Paper2Project Logo"
              width={40}
              height={40}
              style={{ width: "auto", height: "auto" }}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
            Paper2Project
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100/70 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Try Demo Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-6 sm:px-12 max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-8 shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Research to Implementation Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.12]">
          Turn Research Ideas into{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Winning Implementations
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal">
          Upload any <strong>idea, prompt, doc, or research paper</strong>. Our platform checks if it&apos;s already implemented, reveals the exact overlap percentage across 200M+ papers, suggests competitive advantages to beat existing projects, and generates a customizable roadmap from <strong>$0 budget</strong> to scale.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/projects/new"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
            <span>Add Your Idea (PDF, Text, Prompt)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-base font-semibold shadow-xs transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Browse Project Demos</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Overlap % & Prior Art Check
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" /> 200M+ Scholar Papers Search
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-amber-500" /> Competitive Advantages
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-pink-500" /> $0 Free-Tier Roadmap
          </span>
        </div>

        {/* Pipeline Preview Card */}
        <div className="mt-14 w-full p-2 sm:p-3 rounded-3xl bg-white border border-slate-200/90 shadow-xl">
          <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-6 sm:p-8 text-left border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shadow-xs">
                  <Image src="/logo.png" alt="Logo" width={20} height={20} style={{ width: "auto", height: "auto" }} className="object-contain" />
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Paper2Project End-to-End Pipeline</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                100% Working Live Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-white border border-blue-100 hover:border-blue-300 shadow-xs space-y-2 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                  01
                </div>
                <div className="font-bold text-sm text-slate-900">Add Your Idea</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Upload PDF, DOCX, paste text, or write any raw project concept.
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-xs space-y-2 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
                  02
                </div>
                <div className="font-bold text-sm text-slate-900">Analyze Concept</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Deconstructs into key features, target domains, and tech stack.
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-white border border-cyan-100 hover:border-cyan-300 shadow-xs space-y-2 transition-all">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs border border-cyan-200">
                  03
                </div>
                <div className="font-bold text-sm text-slate-900">Literature Check</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Queries 200M+ academic papers & calculates overlap score.
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-white border border-amber-100 hover:border-amber-300 shadow-xs space-y-2 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
                  04
                </div>
                <div className="font-bold text-sm text-slate-900">Win The Market</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Generates architectural advantages to surpass existing work.
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-xs space-y-2 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  05
                </div>
                <div className="font-bold text-sm text-slate-900">Custom Roadmap</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Questionnaire tailors time period, equipment, & $0 to custom budget.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Comprehensive Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Everything You Need to Turn Raw Ideas into Breakthrough Projects
          </h2>
          <p className="mt-4 text-slate-600 text-base">
            Don&apos;t reinvent the wheel. Know exactly what already exists, how to surpass it, and follow a clear step-by-step roadmap tailored to your exact budget and equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Compass className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Is It Implemented? (Gap Analysis)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find out instantly if your idea has already been built. We analyze each feature against millions of research papers, ranking which parts are fully implemented, partially done, or completely novel.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <Lightbulb className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Surpass Existing Work</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Don&apos;t just copy—outperform. Get tactical suggestions on algorithm improvements, low-latency architectures, and novel edge techniques that make your project more advantageous than published papers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Milestone className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Customizable $0+ Roadmap</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Answer quick questions about your available time, equipment (laptop vs cloud GPU), and budget (from $0 free-tier to commercial). Receive a personalized phase-by-phase execution plan.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
              <Bot className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Contextual AI Copilot</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ask questions about your project anytime. The copilot knows your project&apos;s exact features, competitors, budget constraints, and roadmap deliverables.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-pink-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
              <Network className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Dynamic Architecture Flow</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically creates interactive React Flow architecture diagrams showing data pipelines, system layers, and deployment topologies configured for your technology stack.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-xs">
              <DollarSign className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Zero-Cost Toolchain Recommendations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We specify free hosting, free serverless databases, free GPU instances (Colab, Kaggle), and open-source models so you can build professional projects without spending a dime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg border border-slate-200 bg-white p-0.5 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={20} height={20} style={{ width: "auto", height: "auto" }} className="object-contain" />
          </div>
          <span>© 2026 Paper2Project. Research to Implementation Platform.</span>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <Link href="/projects/new" className="text-indigo-600 hover:text-indigo-800 transition-colors">New Project</Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">Dashboard</Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
