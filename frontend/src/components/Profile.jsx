import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile(username);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* Profile Header */}
      <div className="flex items-center gap-10 border-b border-gray-300 pb-10 mb-10">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-500 uppercase font-bold">
          {username?.[0]}
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">{username}</h2>
          <div className="flex gap-6 text-sm">
            <span><strong>{profile.postCount}</strong> posts</span>
            <span><strong>0</strong> followers</span>
            <span><strong>0</strong> following</span>
          </div>
          <p className="text-sm font-semibold">Mock User Profile</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 pb-20">
        {profile.posts.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500 mt-10">No posts yet.</p>
        ) : (
          profile.posts.map((post) => (
            <div key={post.id} className="relative aspect-square overflow-hidden group">
              <img
                src={post.imageUrl.startsWith('http') ? post.imageUrl : `${import.meta.env.VITE_BACKEND_URL}${post.imageUrl}`}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-2 text-center text-xs">
                {post.caption}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
