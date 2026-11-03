
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const API = "/api/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Registration failed"
        );
      }

      toast.success("OTP sent to your email!");
      setStep("verify");
      setCountdown(60);
    } catch (error) {
      toast.error(error.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "OTP verification failed"
        );
      }

      toast.success("Email verified successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to resend OTP"
        );
      }

      toast.success(data.message || "OTP sent successfully");
      setCountdown(60);
      setOtp("");
    } catch (error) {
      toast.error(error.message || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 outline-none focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <BrainCircuit size={23} />
            </div>

            <h1 className="text-2xl font-bold">
              Log<span className="text-blue-500">AI</span>
            </h1>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">

          {step === "signup" ? (
            <>
              <h2 className="text-3xl font-bold">
                Create account
              </h2>

              <p className="text-gray-400 mt-2 mb-8">
                Start monitoring your infrastructure
              </p>

              <form onSubmit={handleSignup} className="space-y-4">

                <input
                  required
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  maxLength={100}
                  className={inputClass}
                />

                <input
                  required
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Work email"
                  className={inputClass}
                />

                <input
                  required
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password (minimum 8 characters)"
                  minLength={8}
                  maxLength={128}
                  className={inputClass}
                />

                <input
                  required
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  minLength={8}
                  maxLength={128}
                  className={inputClass}
                />

                <label className="flex gap-2 text-sm text-gray-400">
                  <input type="checkbox" required />
                  I agree to the Terms & Privacy Policy
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

              </form>

              <p className="text-center text-sm text-gray-500 mt-7">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <div className="bg-blue-600/20 p-4 rounded-2xl">
                  <ShieldCheck size={35} className="text-blue-400" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center">
                Verify your email
              </h2>

              <p className="text-gray-400 text-center mt-3 mb-7">
                We sent a 6-digit verification code to
              </p>

              <div className="flex justify-center items-center gap-2 text-blue-400 mb-7 break-all">
                <Mail size={18} />
                <span>{form.email}</span>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">

                <input
                  required
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
                />

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || countdown > 0}
                  className="text-blue-400 disabled:text-gray-500 text-sm"
                >
                  {countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("signup");
                  setOtp("");
                }}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm mt-6 w-full"
              >
                <ArrowLeft size={16} />
                Back to signup
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
