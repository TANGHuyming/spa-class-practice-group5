import { useState, useEffect } from "react";
import { api } from "../api";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch CSRF token for the form on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await api.getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await api.login(username, password, csrfToken);
      } else {
        await api.signup(username, password, csrfToken);
        setIsLogin(true);
        setError("Signup successful! Please login.");
        return;
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
      // Refresh CSRF token on failure
      const newToken = await api.getCsrfToken();
      setCsrfToken(newToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-white p-8 border border-gray-300 rounded w-80 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center italic">
          PhoneBook
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Use the token as a hidden input within the form */}
          <input type="hidden" name="_csrf" value={csrfToken} />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border bg-gray-50 p-2 text-xs rounded focus:outline-none focus:border-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border bg-gray-50 p-2 text-xs rounded focus:outline-none focus:border-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-1 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-xs mt-4 text-center">{error}</p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-300 text-center">
          <p className="text-sm">
            {isLogin ? "Don't have an account?" : "Have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 font-semibold"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
