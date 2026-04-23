import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      const data = await api.getFeed();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading feed...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-md mx-auto mt-6 flex flex-col gap-8 pb-20">
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet. Be the first to upload!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-300 rounded overflow-hidden">
            <div className="p-3 font-semibold text-sm border-b border-gray-100">
              {post.username}
            </div>
            <img
              src={post.imageUrl.startsWith('http') ? post.imageUrl : `${import.meta.env.VITE_BACKEND_URL}${post.imageUrl}`}
              alt={post.caption}
              className="w-full h-auto aspect-square object-cover"
            />
            <div className="p-3">
              <p className="text-sm">
                <span className="font-semibold mr-2">{post.username}</span>
                {post.caption}
              </p>
              <p className="text-xs text-gray-400 mt-2 uppercase">
                {new Date(post.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
