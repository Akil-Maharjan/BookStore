import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../api/auth.js";
import { useAuth } from "../store/auth.js";
import toast from "react-hot-toast";
import Background from "../components/Background.jsx";
import { Eye, EyeClosed } from "lucide-react";
export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

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
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      setAuth({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      });
      const toastId = toast.success("Logged in");
      dismissAfterOneSecond(toastId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Background />
      <div className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-card relative z-10">
        <h1 className="text-3xl font-bold mb-4">Sign In</h1>
        {error && (
          <div className="mb-3 rounded bg-red-500/20 border border-red-500/40 text-red-100 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
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
              className="absolute  inset-y-0 top-1/2 right-3 flex cursor-pointer  text-white/70 hover:text-white"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-white/70 mt-3">
          Don't have an account?{" "}
          <Link className="text-brand" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
