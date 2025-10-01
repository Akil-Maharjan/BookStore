import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";
import { logout as logoutApi } from "../api/auth.js";
import toast from "react-hot-toast";
import {
  Home as HomeIcon,
  Info,
  Sparkles,
  BookOpen,
  Mail,
} from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const clearAuth = useAuth((s) => s.clearAuth);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef(null);

  const dismissAfterOneSecond = (toastId) => {
    if (!toastId) return;
    setTimeout(() => toast.dismiss(toastId), 2000);
  };

  const scrollTop = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const doLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
    clearAuth();
    navigate("/login");
    setOpen(false);
    const toastId = toast.success("Logged out");
    dismissAfterOneSecond(toastId);
  };

  React.useEffect(() => {
    const onClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const scrollToId = (id) => {
    const go = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(go, 60);
    } else {
      go();
    }
    setOpen(false);
    if (["features", "about", "contact"].includes(id)) setActive(id);
    else if (id === "main") setActive("home");
    else setActive("");
  };

  React.useEffect(() => {
    if (location.pathname.startsWith("/books")) {
      setActive("books");
      return;
    }
    if (location.pathname !== "/") {
      setActive("");
      return;
    }

    const ids = ["features", "about", "contact"];
    let frame = null;

    const updateActiveSection = () => {
      frame = null;
      const marker = window.innerHeight * 0.35;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom >= marker) {
          current = id;
          break;
        }
      }
      setActive(current || "home");
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [location.pathname]);

  const baseLink =
    "group px-3 py-2 cursor-pointer rounded flex items-center gap-2 text-sm font-poppins transition-colors";
  const activeCls = " text-black dark:text-black dark:bg-slate-200";
  const makeCls = (key) => baseLink + (active === key ? activeCls : "");
  const iconClass = (key) =>
    `${active === key ? "text-black" : "text-slate-600 dark:text-white"} group-hover:text-black`;

  return (
    <header className="sticky top-0 z-50 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.55),0_2px_6px_rgba(15,23,42,0.18)] border-b border-white/40 dark:border-slate-800 text-slate-800 backdrop-blur bg-white/85 dark:bg-slate-900/25 dark:text-slate-100">
      <nav className="max-w-[96rem] mx-auto px-4">
        <div className="flex items-center justify-between h-20 ">
          {/* Left: Brand */}
          <Link
            to="/"
            className="font-extrabold tracking-wide"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                const main = document.getElementById("main") || document.body;
                (main?.scrollIntoView ? main : document.documentElement).scrollIntoView(
                  { behavior: "smooth", block: "start" }
                );
              } else {
                scrollToId("main");
              }
            }}
          >
            <img src={logo} alt="" className="w-25 h-25"/>
          </Link>

          {/* Center nav links (desktop & md) */}
          <div className="hidden md:flex items-center gap-4">
            
            <Link
              to="/books"
              onClick={() => {
                setOpen(false);
                scrollTop();
              }}
              className={makeCls("books") + " hover:text-black dark:hover:bg-slate-200"}
            >
              <BookOpen size={18} className={iconClass("books")} />
              Books
            </Link>
            <button
              onClick={() => scrollToId("about")}
              className={makeCls("about") + " hover:text-black dark:hover:bg-slate-200"}
            >
              <Info size={18} className={iconClass("about")} />
              About
            </button>
            <button
              onClick={() => scrollToId("features")}
              className={makeCls("features") + " hover:text-black dark:hover:bg-slate-200"}
            >
              <Sparkles size={18} className={iconClass("features")} />
              Features
            </button>
            <button
              onClick={() => scrollToId("contact")}
              className={makeCls("contact") + " hover:text-black dark:hover:bg-slate-200"}
            >
              <Mail size={18} className={iconClass("contact")} />
              Contact
            </button>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              isAdmin() ? (
                <Link
                  to="/admin/orders"
                  onClick={() => {
                    setOpen(false);
                    scrollTop();
                  }}
                  className="px-3 py-2 rounded hover:text-black dark:hover:bg-slate-200"
                >
                  📦 Orders
                </Link>
              ) : (
                <Link
                  to="/cart"
                  onClick={() => {
                    setOpen(false);
                    scrollTop();
                  }}
                  className="px-3 py-2 rounded hover:text-black dark:hover:bg-slate-200"
                >
                  🛒 Cart
                </Link>
              )
            ) : (
              <Link
                to="/cart"
                onClick={() => {
                  setOpen(false);
                  scrollTop();
                }}
                className="px-3 py-2 rounded hover:text-black dark:hover:bg-slate-200"
              >
                🛒 Cart
              </Link>
            )}
            {!user ? (
              <Link
                to="/login"
                onClick={() => {
                  setOpen(false);
                  scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3  py-2 cursor-pointer rounded border hover:text-black dark:hover:bg-slate-200"
              >
                Login
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                  title={user?.name || "Profile"}
                >
                  {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg p-1 dark:bg-slate-900 dark:border-slate-700">
                    <Link
                      to="/dashboard"
                      onClick={() => {
                        setProfileOpen(false);
                        scrollTop();
                      }}
                      className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        doLogout();
                        scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Burger for small + medium devices */}
          <button
            className="md:hidden cursor-pointer inline-flex items-center justify-center rounded border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden flex flex-col space-y-1 pb-3">
            <Link
              to="/books"
              onClick={() => {
                setOpen(false);
                scrollTop();
              }}
              className={makeCls("books") + " hover:bg-white hover:text-black dark:hover:bg-white"}
            >
              <BookOpen size={18} className={iconClass("books")} />
              Books
            </Link>
            <button
              onClick={() => scrollToId("about")}
              className={makeCls("about") + " hover:bg-white hover:text-black dark:hover:bg-white"}
            >
              <Info size={18} className={iconClass("about")} />
              About
            </button>
            <button
              onClick={() => scrollToId("features")}
              className={makeCls("features") + " hover:bg-white hover:text-black dark:hover:bg-white"}
            >
              <Sparkles size={18} className={iconClass("features")} />
              Features
            </button>
            <button
              onClick={() => scrollToId("contact")}
              className={makeCls("contact") + " hover:bg-white hover:text-black dark:hover:bg-white"}
            >
              <Mail size={18} className={iconClass("contact")} />
              Contact
            </button>
            {user && (
              <Link
                to="/dashboard"
                onClick={() => {
                  setOpen(false);
                  scrollTop();
                }}
                className={makeCls("dashboard") + " hover:bg-white hover:text-black dark:hover:bg-white"}
              >
                Dashboard
              </Link>
            )}
            {user && isAdmin() && (
              <>
                <Link
                  to="/admin/books"
                  onClick={() => {
                    setOpen(false);
                    scrollTop();
                  }}
                  className={makeCls("dashboard") + " hover:bg-white hover:text-black dark:hover:bg-white"}
                >
                  Manage Books
                </Link>
                <Link
                  to="/admin/orders"
                  onClick={() => {
                    setOpen(false);
                    scrollTop();
                  }}
                  className={makeCls("dashboard") + " hover:bg-white hover:text-black dark:hover:bg-white"}
                >
                  📦 Orders
                </Link>
              </>
            )}
            {user && !isAdmin() && (
              <Link
                to="/cart"
                onClick={() => {
                  setOpen(false);
                  scrollTop();
                }}
                className={makeCls("cart") + " hover:bg-white hover:text-black dark:hover:bg-white"}
              >
                🛒 Cart
              </Link>
            )}
            {!user && (
              <Link
                to="/cart"
                onClick={() => {
                  setOpen(false);
                  scrollTop();
                }}
                className={makeCls("cart") + " hover:bg-white hover:text-black dark:hover:bg-white"}
              >
                🛒 Cart
              </Link>
            )}
            {!user ? (
              <Link
                to="/login"
                onClick={() => {
                  setOpen(false);
                  scrollTop();
                }}
                className="px-3 py-2 rounded bg-brand text-white hover:bg-brand-dark w-fit"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={() => {
                  doLogout();
                  scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 rounded border border-slate-200 dark:border-slate-600 hover:bg-white hover:text-black dark:hover:bg-white w-fit"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

