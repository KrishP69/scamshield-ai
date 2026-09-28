"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ShareRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const resolveShare = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/reports/share/${token}`);
        if (!res.ok) {
          throw new Error("This shared report link has expired or is invalid.");
        }
        const data = await res.json();
        if (data.scan_id) {
          router.replace(`/report/${data.scan_id}`);
        } else {
          throw new Error("Invalid share token format.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load shared report.");
      }
    };

    resolveShare();
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-[#090D1F] p-4 text-ink dark:text-paper">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-ink-800 border border-signal/20 text-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-signal mx-auto mb-3" />
          <h1 className="font-display font-bold text-xl mb-2">Share Link Unavailable</h1>
          <p className="text-xs text-ink/70 dark:text-paper/70 leading-relaxed mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push("/scan")}>Scan a Message</Button>
            <Link href="/" className="px-4 py-2 text-xs font-semibold text-ink/75 dark:text-paper/75 hover:text-ink">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper dark:bg-[#090D1F] text-ink dark:text-paper">
      <Loader2 className="w-8 h-8 animate-spin text-ultramarine mb-3" />
      <p className="font-mono text-xs text-ink/60 dark:text-paper/60">
        Verifying secure share link token...
      </p>
    </div>
  );
}
