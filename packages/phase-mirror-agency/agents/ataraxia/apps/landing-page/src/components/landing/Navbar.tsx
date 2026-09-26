"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent-cyan" />
          <span className="font-heading text-xl font-bold tracking-tight text-primary-text">
            ATARAXIA
          </span>
        </div>
        
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#architecture" className="text-sm font-medium text-secondary-text hover:text-accent-cyan transition-colors">
            Architecture
          </Link>
          <Link href="#sovereign" className="text-sm font-medium text-secondary-text hover:text-accent-cyan transition-colors">
            Sovereign Node
          </Link>
          <Link href="#math" className="text-sm font-medium text-secondary-text hover:text-accent-cyan transition-colors">
            Mathematics
          </Link>
          <Link href="#deployment" className="text-sm font-medium text-secondary-text hover:text-accent-cyan transition-colors">
            Deployment
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-primary-text hover:bg-white/5 transition-all md:block">
            Sign In
          </button>
          <button className="rounded-full bg-accent-cyan px-5 py-2 text-sm font-bold text-background hover:opacity-90 transition-all">
            Get Access
          </button>
        </div>
      </div>
    </nav>
  );
}
