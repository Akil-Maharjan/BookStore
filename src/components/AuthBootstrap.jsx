import { useEffect } from "react";
import { useAuth } from "../store/auth.js";
import { me } from "../api/auth.js";

export default function AuthBootstrap() {
  const setAuth = useAuth((s) => s.setAuth);
  const setLoading = useAuth((s) => s.setLoading);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const user = await me();
        // preserve token from store (already persisted)
        setAuth({ user, token });
      } catch {
        // not logged in
      } finally {
        setLoading(false);
      }
    })();
  }, [setAuth, setLoading, token]);

  return null;
}
