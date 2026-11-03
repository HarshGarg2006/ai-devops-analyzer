
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  FileText,
  AlertTriangle,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Clock,
  CheckCircle,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

const API = "/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("loggedIn");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const fetchDashboard = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [statsResponse, historyResponse] = await Promise.all([
        fetch(`${API}/logs/stats`, { headers }),
        fetch(`${API}/logs/history`, { headers }),
      ]);

      if (
        statsResponse.status === 401 ||
        historyResponse.status === 401
      ) {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
        return;
      }

      if (!statsResponse.ok || !historyResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const statsData = await statsResponse.json();
      const historyData = await historyResponse.json();

      setStats(statsData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Analyses",
      value: stats?.total_analyses ?? 0,
      icon: Activity,
    },
    {
      title: "Total Log Lines",
      value: stats?.total_lines ?? 0,
      icon: FileText,
    },
    {
      title: "Total Errors",
      value: stats?.total_errors ?? 0,
      icon: AlertTriangle,
    },
    {
      title: "Critical Issues",
      value: stats?.critical ?? 0,
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <nav className="border-b border-white/10 px-5 md:px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          🤖 Log<span className="text-blue-500">AI</span>
        </h1>

        <div className="flex gap-2 md:gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
            title="Refresh dashboard"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            onClick={logout}
            className="px-3 md:px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 flex items-center gap-2"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-12">

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">

          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              DevOps Dashboard
            </h2>

            <p className="text-gray-400 mt-2">
              Your AI-powered observability workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={16} />
              Connected to backend
            </div>

            <button
              onClick={() => navigate("/analyze")}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold flex items-center gap-2 transition-all duration-300 hover:-translate-y-1"
            >
              <Plus size={19} />
              Analyze New Logs
            </button>

          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
            {error}

            <button
              onClick={fetchDashboard}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="min-w-0 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-center gap-2">
                  <p className="text-gray-400 text-sm">
                    {card.title}
                  </p>

                  <Icon className="text-blue-400 shrink-0" size={21} />
                </div>

                <h3 className="text-3xl font-bold mt-4">
                  {loading
                    ? "..."
                    : Number(card.value).toLocaleString()}
                </h3>
              </div>
            );
          })}

        </div>

        <section className="mt-12">

          <div className="flex justify-between items-center mb-5 gap-3">
            <h3 className="text-xl md:text-2xl font-bold">
              Recent Log Analyses
            </h3>

            <span className="text-sm text-gray-400 whitespace-nowrap">
              {history.length} records
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-x-auto">

            {loading ? (
              <p className="p-8 text-center text-gray-400">
                Loading analysis history...
              </p>
            ) : history.length === 0 ? (
              <p className="p-8 text-center text-gray-400">
                No log analyses found. Upload your first log file.
              </p>
            ) : (
              <table className="w-full text-left min-w-[650px]">

                <thead className="bg-white/[0.04] text-gray-400 text-sm">
                  <tr>
                    <th className="p-4">Filename</th>
                    <th className="p-4">Lines</th>
                    <th className="p-4">Errors</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4 font-medium">
                        {item.filename}
                      </td>

                      <td className="p-4 text-gray-300">
                        {item.total_lines}
                      </td>

                      <td className="p-4 text-gray-300">
                        {item.error_count}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.overall_severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-400"
                              : item.overall_severity === "HIGH"
                              ? "bg-orange-500/20 text-orange-400"
                              : item.overall_severity === "MEDIUM"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {item.overall_severity}
                        </span>
                      </td>

                      <td className="p-4 text-gray-400 text-sm">
                        <span className="flex items-center gap-2">
                          <Clock size={14} />

                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}
