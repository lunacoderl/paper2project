"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { logoutUser } from "@/lib/firebase";
import { LogOut, Plus, FolderKanban, Sparkles } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 sm:hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={24}
              height={24}
              style={{ width: "auto", height: "auto" }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </Link>

        {title ? (
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-100">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-900">Project Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold leading-none text-slate-800">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-slate-500 leading-none mt-1">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
