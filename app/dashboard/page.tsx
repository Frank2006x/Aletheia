"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface LinkItem {
  id: string;
  token: string;
  uploadUrl: string;
  status: "pending" | "used";
  createdAt: string;
  report: {
    id: string;
    fileName: string;
    fileHash: string;
    ipfsCid: string | null;
    ipfsUrl: string | null;
    uploadedAt: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in?callbackUrl=/dashboard");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) fetchLinks();
  }, [session]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) setLinks(data.links);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/links", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setNewLink(data.link.uploadUrl);
        await fetchLinks();
      }
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPending || !session) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">
            Investor Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{session.user.email}</p>
        </div>
        <button
          onClick={createLink}
          disabled={creating}
          className="px-5 py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D5F4C] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {creating ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Upload Link
            </>
          )}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* New link banner */}
        {newLink && (
          <div className="bg-[#E8F4F5] border border-[#028090] rounded-lg p-4">
            <p className="text-sm font-semibold text-[#1B4332] mb-2">
              ✅ New upload link created! Send this to your supplier:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border rounded px-3 py-2 text-sm text-gray-700 break-all">
                {newLink}
              </code>
              <button
                onClick={() => copyToClipboard(newLink)}
                className="px-4 py-2 bg-[#028090] text-white text-sm rounded-lg hover:bg-[#026070] transition-colors whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setNewLink(null)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Links", value: links.length },
            {
              label: "Pending",
              value: links.filter((l) => l.status === "pending").length,
            },
            {
              label: "Reports Received",
              value: links.filter((l) => l.status === "used").length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border p-5 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-[#1B4332]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Links table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-base font-semibold text-gray-800">
              Upload Links
            </h2>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Loading links...
            </div>
          ) : links.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No links yet. Click <strong>Create Upload Link</strong> to send
              one to a supplier.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map((link) => (
                  <tr
                    key={link.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {link.token.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          link.status === "used"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${link.status === "used" ? "bg-green-500" : "bg-yellow-500"}`}
                        />
                        {link.status === "used" ? "Uploaded" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {link.report ? (
                        <div className="space-y-1">
                          <p className="font-medium text-gray-800 truncate max-w-45">
                            {link.report.fileName}
                          </p>
                          {link.report.ipfsCid && (
                            <a
                              href={link.report.ipfsUrl ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#028090] hover:underline font-mono"
                            >
                              {link.report.ipfsCid.substring(0, 20)}...
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {link.status === "pending" && (
                          <button
                            onClick={() => copyToClipboard(link.uploadUrl)}
                            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            Copy Link
                          </button>
                        )}
                        {link.status === "used" && (
                          <button
                            onClick={() => router.push(`/upload/${link.token}`)}
                            className="text-xs px-3 py-1.5 rounded-md bg-[#1B4332] text-white hover:bg-[#2D5F4C] transition-colors"
                          >
                            View Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
