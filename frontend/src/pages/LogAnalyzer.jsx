
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  ArrowLeft,
  Activity,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const API = "/api";

export default function LogAnalyzer() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [logText, setLogText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["log", "txt"].includes(extension)) {
      toast.error("Only .log and .txt files are supported");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      return;
    }

    try {
      const text = await selectedFile.text();

      setFile(selectedFile);
      setLogText(text);
      setResult(null);
      toast.success("Log file loaded successfully");
    } catch {
      toast.error("Unable to read this file");
    }
  };

  const analyzeLogs = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!logText.trim()) {
      toast.error("Please upload a log file or enter log text");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API}/logs/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file?.name || "manual_logs.log",
          log_text: logText,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Log analysis failed"
        );
      }

      setResult(data);
      toast.success("Log analysis completed!");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setFile(null);
    setLogText("");
    setResult(null);
  };

  const findings = Array.isArray(result?.findings)
    ? result.findings
    : [];

  const summary =
    result?.summary ||
    result?.analysis?.summary ||
    "Analysis completed successfully.";

  const stats = [
    {
      title: "Total Lines",
      value: result?.total_lines ?? result?.analysis?.total_lines ?? 0,
      icon: FileText,
    },
    {
      title: "Errors",
      value: result?.error_count ?? result?.analysis?.error_count ?? 0,
      icon: AlertTriangle,
    },
    {
      title: "Critical",
      value: result?.critical_count ?? result?.analysis?.critical_count ?? 0,
      icon: ShieldAlert,
    },
    {
      title: "Overall Severity",
      value: result?.overall_severity ?? result?.analysis?.overall_severity ?? "N/A",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <nav className="border-b border-white/10 px-6 md:px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Log<span className="text-blue-500">AI</span>
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        <h2 className="text-3xl md:text-4xl font-bold">
          Log Analyzer
        </h2>

        <p className="text-gray-400 mt-2">
          Upload infrastructure logs and identify potential issues.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">

          <section className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">

            <h3 className="text-xl font-semibold mb-5">
              Upload Log File
            </h3>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-10 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition">
              <UploadCloud size={42} className="text-blue-400 mb-4" />

              <span className="font-medium">
                Click to upload your log file
              </span>

              <span className="text-sm text-gray-500 mt-2">
                Supports .log and .txt (Max 5 MB)
              </span>

              <input
                type="file"
                accept=".log,.txt,text/plain"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {file && (
              <div className="mt-5 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                <FileText className="text-blue-400" />

                <div className="min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm text-gray-400 mb-2">
                Or paste log content
              </label>

              <textarea
                value={logText}
                onChange={(e) => {
                  setLogText(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                rows={9}
                placeholder="Paste your application logs here..."
                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 font-mono text-sm resize-y"
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-5">

              <button
                onClick={analyzeLogs}
                disabled={loading || !logText.trim()}
                className="flex-1 min-w-[150px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold flex justify-center items-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    Analyze Logs
                  </>
                )}
              </button>

              <button
                onClick={clearAnalysis}
                className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Clear
              </button>

            </div>

          </section>

          <section className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">

            <h3 className="text-xl font-semibold mb-5">
              Analysis Results
            </h3>

            {!result ? (
              <div className="min-h-[350px] flex flex-col items-center justify-center text-center">
                <div className="p-5 rounded-2xl bg-blue-500/10 mb-4">
                  <Activity size={40} className="text-blue-400" />
                </div>

                <p className="font-medium">
                  No analysis available
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Upload or paste logs and click Analyze Logs.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">

                  {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="p-4 rounded-xl bg-black/20 border border-white/10"
                      >
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Icon size={17} />
                          {item.title}
                        </div>

                        <p className="text-2xl font-bold mt-3 break-words">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : item.value}
                        </p>
                      </div>
                    );
                  })}

                </div>

                <div className="mt-6 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle size={18} className="text-blue-400" />
                    Analysis Summary
                  </h4>

                  <p className="text-gray-300 text-sm mt-3 leading-6">
                    {summary}
                  </p>
                </div>

                {findings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">
                      Detected Findings
                    </h4>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                      {findings.map((finding, index) => (
                        <div
                          key={finding.id ?? index}
                          className="p-4 rounded-xl bg-black/20 border border-white/10"
                        >
                          <div className="flex justify-between gap-3 flex-wrap">
                            <p className="font-medium">
                              {finding.title ||
                                finding.message ||
                                finding.issue ||
                                `Finding ${index + 1}`}
                            </p>

                            <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                              {finding.severity || "INFO"}
                            </span>
                          </div>

                          {finding.description && (
                            <p className="text-sm text-gray-400 mt-2">
                              {finding.description}
                            </p>
                          )}

                          {(finding.resolution || finding.recommendation) && (
                            <p className="text-sm text-blue-300 mt-3">
                              Recommendation: {finding.resolution || finding.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}
