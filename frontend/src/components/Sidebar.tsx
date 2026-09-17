"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Lightbulb,
  MessageSquareCode,
  Milestone,
  Network,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  projectId: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
      active: pathname === `/projects/${projectId}`,
      color: "text-indigo-600",
    },
    {
      name: "Discover & Compare",
      href: `/projects/${projectId}/discover`,
      icon: Compass,
      active: pathname.startsWith(`/projects/${projectId}/discover`),
      color: "text-blue-600",
    },
    {
      name: "Improve & Advantages",
      href: `/projects/${projectId}/improve`,
      icon: Lightbulb,
      active: pathname.startsWith(`/projects/${projectId}/improve`),
      color: "text-amber-500",
    },
    {
      name: "Copilot Assistant",
      href: `/projects/${projectId}/copilot`,
      icon: MessageSquareCode,
      active: pathname.startsWith(`/projects/${projectId}/copilot`),
      color: "text-purple-600",
    },
    {
      name: "Roadmap & Budget",
      href: `/projects/${projectId}/roadmap`,
      icon: Milestone,
      active: pathname.startsWith(`/projects/${projectId}/roadmap`),
      color: "text-emerald-600",
    },
    {
      name: "Architecture Graph",
      href: `/projects/${projectId}/architecture`,
      icon: Network,
      active: pathname.startsWith(`/projects/${projectId}/architecture`),
      color: "text-pink-600",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white/95 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-20 shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-slate-200 bg-white p-1">
              <Image
                src="/logo.png"
                alt="Paper2Project Logo"
                width={36}
                height={36}
                style={{ width: "auto", height: "auto" }}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                Paper2Project
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Research to Code AI</span>
            </div>
          </Link>
        </div>

        {/* Back to all projects link */}
        <div className="px-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100/80 font-medium transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                  item.active
                    ? "bg-indigo-50/90 text-indigo-700 border-l-3 border-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <Icon className={cn("w-4 h-4", item.active ? "text-indigo-600" : item.color)} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-700 font-medium">Scholar AI Active</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
            200M+ Papers
          </span>
        </div>
      </div>
    </aside>
  );
}
