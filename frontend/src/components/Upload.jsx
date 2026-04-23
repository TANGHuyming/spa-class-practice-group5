import { useState, useEffect } from "react";
import { api } from "../api";

export default function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch CSRF token for the form on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await api.getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.upload(file, caption, csrfToken);
      setFile(null);
      setCaption("");
      onUploadSuccess();
    } catch (err) {
      setError(err.message);
      // Refresh token on failure
      const newToken = await api.getCsrfToken();
      setCsrfToken(newToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white border border-gray-300 p-6 rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">New Post</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hidden CSRF input within the form */}
        <input type="hidden" name="_csrf" value={csrfToken} />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required
        />
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border rounded p-2 text-sm focus:outline-none focus:border-blue-500 h-24"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Share"}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-xs mt-4 text-center">{error}</p>
      )}
    </div>
  );
}
