import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../api/auth.js";
import { useAuth } from "../store/auth.js";
import Background from "../components/Background.jsx";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dismissAfterOneSecond = (toastId) => {
    if (!toastId) return;
    setTimeout(() => toast.dismiss(toastId), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    const alphabetCount = (trimmedName.match(/[A-Za-z]/g) || []).length;
    if (alphabetCount < 4) {
      setError("Name must contain more than 3 alphabetic characters.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerApi(trimmedName, trimmedEmail, password);
      setAuth({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      });
      const toastId = toast.success("Registered successfully");
      dismissAfterOneSecond(toastId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Background />
      <div className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-card relative z-10">
        <h1 className="text-3xl font-bold mb-4">Create Account</h1>
        {error && (
          <div className="mb-3 rounded bg-red-500/20 border border-red-500/40 text-red-100 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 top-1/2 right-3 flex cursor-pointer  text-white/70 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeClosed className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand hover:bg-brand-dark text-white py-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-white/70 mt-3">
          Already have an account?{" "}
          <Link className="text-brand" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
