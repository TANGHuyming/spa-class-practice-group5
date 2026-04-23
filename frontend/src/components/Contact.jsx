import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Contact({ onUploadSuccess }) {
  const [tel, setTel] = useState('');
  const [caption, setCaption] = useState('');
  const [name, setName] = useState('');

  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch CSRF token for the form on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await api.getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    try {
      await api.addContact(tel, name, caption, csrfToken);
      setTel('');
      setName('');
      setCaption('');
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
      <h2 className="text-xl font-bold mb-4 text-center">New Contact</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hidden CSRF input within the form */}
        <input type="hidden" name="_csrf" value={csrfToken} />
        <label for="tel" className="block text-sm font-medium text-black">
          Tel:
        </label>
        <input
          type="tel"
          id="tel"
          name="tel"
          onChange={(e) => setTel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
          required
        />
        <label for="name" className="block text-sm font-medium text-black">
          Username:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
          required
        />
        <textarea
          placeholder="Write a description..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Share'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
    </div>
  );
}
