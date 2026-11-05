
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            data.detail || "Please verify your email before logging in"
          );
        }

        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }

        throw new Error(
          data.detail || "Login failed. Please try again."
        );
      }

      if (!data.access_token) {
        throw new Error("Login response did not contain an access token");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.removeItem("loggedIn");

      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });

    } catch (error) {
      if (error instanceof TypeError) {
        toast.error(
          "Cannot connect to server. Check whether the backend is running."
        );
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <BrainCircuit size={23} />
            </div>

            <h1 className="text-2xl font-bold">
              Log<span className="text-blue-500">AI</span>
            </h1>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">

          <h2 className="text-3xl font-bold">
            Welcome back
          </h2>

          <p className="text-gray-400 mt-2 mb-8">
            Sign in to your DevOps workspace
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="text-sm text-gray-300 block mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-3.5 text-gray-500"
                />

                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="text-sm text-gray-300 block mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-3.5 text-gray-500"
                />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-blue-500 outline-none"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-3.5 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 font-semibold transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 mt-7">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300"
            >
              Create account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
