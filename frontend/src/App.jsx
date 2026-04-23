import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Feed from "./components/Feed";
import Upload from "./components/Upload";
import { api } from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [view, setView] = useState("feed"); // 'feed', 'upload', or 'profile'
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.checkAuth();
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsInitialLoad(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setIsAuthenticated(false);
      setView("feed");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleUploadSuccess = () => {
    setView("feed");
    setRefreshKey((prev) => prev + 1); // Trigger feed refresh
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen pt-20">
        <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "feed":
        return <Feed key={refreshKey} />;
      case "upload":
        return <Upload onUploadSuccess={handleUploadSuccess} />;
      default:
        return <Feed key={refreshKey} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-300 sticky top-0 z-10 h-16 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex justify-between px-4 items-center">
          <h1
            className="text-xl font-bold italic cursor-pointer"
            onClick={() => setView("feed")}
          >
            PhoneBook
          </h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setView("feed")}
              className={`text-sm font-semibold ${view === "feed" ? "text-black" : "text-gray-400"}`}
            >
              Home
            </button>
            <button
              onClick={() => setView("upload")}
              className={`text-sm font-semibold ${view === "upload" ? "text-black" : "text-gray-400"}`}
            >
              Upload
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-4">{renderView()}</main>
    </div>
  );
}

export default App;
