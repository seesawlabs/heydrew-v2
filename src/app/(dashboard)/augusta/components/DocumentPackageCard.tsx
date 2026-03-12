"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeneratedDocument } from "../lib/documents/generateAll";
import { downloadBlob, downloadAllAsZip } from "../lib/documents/generateAll";

const ICONS: Record<string, string> = {
  "Rental Agreement": "📄",
  "Meeting Agendas": "📋",
  "Meeting Minutes": "📝",
  "Rate Justification Memo": "📊",
  "Calendar Tracker": "📅",
};

type DriveState =
  | { status: "idle" }
  | { status: "authenticating" }
  | { status: "uploading" }
  | { status: "done"; folderUrl: string }
  | { status: "error"; message: string };

interface DocumentPackageCardProps {
  documents: GeneratedDocument[];
}

export function DocumentPackageCard({ documents }: DocumentPackageCardProps) {
  const [driveState, setDriveState] = useState<DriveState>({ status: "idle" });

  const handleUpload = useCallback(async () => {
    setDriveState({ status: "uploading" });
    const formData = new FormData();
    for (const doc of documents) {
      formData.append("files", doc.blob, doc.filename);
    }

    try {
      const res = await fetch("/api/gdrive/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.folderUrl) {
        setDriveState({ status: "done", folderUrl: data.folderUrl });
      } else {
        setDriveState({ status: "error", message: data.error || "Upload failed" });
      }
    } catch {
      setDriveState({ status: "error", message: "Upload failed" });
    }
  }, [documents]);

  // Listen for OAuth popup completion
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "gdrive-auth-success") return;
      handleUpload();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handleUpload]);

  const startGDriveAuth = () => {
    setDriveState({ status: "authenticating" });
    const popup = window.open(
      "/api/gdrive/auth",
      "gdrive-auth",
      "width=500,height=600,left=200,top=100"
    );

    // Detect popup closed without completing auth
    const pollTimer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollTimer);
        setDriveState((prev) =>
          prev.status === "authenticating" ? { status: "idle" } : prev
        );
      }
    }, 1000);
  };

  const renderDriveButton = () => {
    switch (driveState.status) {
      case "idle":
        return (
          <button
            onClick={startGDriveAuth}
            className="w-full py-3 min-h-[44px] bg-white text-black border-2 border-black rounded-xl
              font-body text-body-lg font-semibold
              btn-brutal flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
              <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85L73.55 76.8z" fill="#EA4335"/>
              <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832D"/>
              <path d="M59.85 53H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.4c1.6 0 3.15-.45 4.5-1.2z" fill="#2684FC"/>
              <path d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.6 25l16.25 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
            </svg>
            <span>Save to Google Drive</span>
          </button>
        );
      case "authenticating":
        return (
          <button
            disabled
            className="w-full py-3 min-h-[44px] bg-white text-charcoal/60 border-2 border-black rounded-xl
              font-body text-body-lg font-semibold flex items-center justify-center gap-2 cursor-wait"
          >
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Google...</span>
          </button>
        );
      case "uploading":
        return (
          <button
            disabled
            className="w-full py-3 min-h-[44px] bg-white text-charcoal/60 border-2 border-black rounded-xl
              font-body text-body-lg font-semibold flex items-center justify-center gap-2 cursor-wait"
          >
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Uploading to Drive...</span>
          </button>
        );
      case "done":
        return (
          <a
            href={driveState.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 min-h-[44px] bg-white text-black border-2 border-black rounded-xl
              font-body text-body-lg font-semibold
              btn-brutal flex items-center justify-center gap-2"
          >
            <span>&#10003;</span>
            <span>Open in Google Drive</span>
          </a>
        );
      case "error":
        return (
          <button
            onClick={startGDriveAuth}
            className="w-full py-3 min-h-[44px] bg-white text-red-primary border-2 border-black rounded-xl
              font-body text-body-lg font-semibold
              btn-brutal flex items-center justify-center gap-2"
          >
            <span>Try again — {driveState.message}</span>
          </button>
        );
    }
  };

  return (
    <div className="pl-11">
      <div className="bg-white border-2 border-black rounded-xl card-brutal-lg p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow border-2 border-black flex items-center justify-center">
            <span className="text-black text-xl">&#10003;</span>
          </div>
          <div>
            <h3 className="font-heading text-heading-md text-black">
              Your documents are ready
            </h3>
            <p className="text-subtext-sm text-charcoal/60">
              5 compliance documents generated
            </p>
          </div>
        </div>

        {/* Document list */}
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className="flex items-center justify-between p-3 bg-yellow/30 border-2 border-black rounded-xl hover:bg-yellow/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{ICONS[doc.name] || "📄"}</span>
                <div>
                  <p className="text-body-sm font-medium text-black">
                    {doc.name}
                  </p>
                  <p className="text-subtext-xs text-charcoal/60">
                    {doc.filename}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadBlob(doc.blob, doc.filename)}
                className="px-3 py-1.5 min-h-[36px] text-body-sm font-medium text-black bg-white border-2 border-black rounded-xl
                  btn-brutal"
              >
                Download
              </button>
            </div>
          ))}
        </div>

        {/* ZIP download */}
        <button
          onClick={() => downloadAllAsZip(documents)}
          className="w-full py-3 min-h-[44px] bg-black text-white rounded-xl
            font-body text-body-lg font-semibold
            btn-brutal-lg flex items-center justify-center gap-2"
        >
          <span>Download all as ZIP</span>
        </button>

        {/* Google Drive */}
        {renderDriveButton()}
      </div>
    </div>
  );
}
