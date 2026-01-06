import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Heart, Star, Search } from 'lucide-react';

interface ConnectionsProps {
  user: User;
  onViewProfile: (id: string) => void;
  onUserUpdated: (u: User) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ user, onViewProfile, onUserUpdated }) => {
  const [suggested, setSuggested] = useState<User[]>([]);
  const [filteredSuggested, setFilteredSuggested] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    loadSuggestions();
  }, [user.id]);

  useEffect(() => {
    // Filter suggestions based on search query
    const filtered = suggested.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSuggested(filtered);
  }, [searchQuery, suggested]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const interests = user.interests || [];
      const s = await db.getUsersByInterests(user.id, interests);
      setSuggested(s);
      
      // Load average scores for all suggested users
      const stats: { [key: string]: any } = {};
      for (const suggestedUser of s) {
        try {
          const stat = await db.getDashboardStats(suggestedUser.id);
          stats[suggestedUser.id] = stat;
        } catch (err) {
          stats[suggestedUser.id] = { avgScore: 0 };
        }
      }
      setUserStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (targetId: string) => {
    try {
      const updated = await db.toggleFavorite(user.id, targetId);
      if (updated) onUserUpdated(updated);
      // reload suggestions to update UI
      loadSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-2">Connections</h2>
        <p className="text-slate-400 text-sm">People with similar interests. Add to favorites or view their public profile.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600"
        />
      </div>

      <div>
        {loading && <p className="text-slate-400">Loading suggestions...</p>}
        {!loading && filteredSuggested.length === 0 && suggested.length === 0 && (
          <p className="text-slate-400">No similar users found. Add more interests to improve suggestions.</p>
        )}
        {!loading && filteredSuggested.length === 0 && suggested.length > 0 && (
          <p className="text-slate-400">No users match your search.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSuggested.map(s => (
            <div 
              key={s.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-600 transition-all duration-300 transform hover:scale-[1.05] flex flex-col"
            >
              {/* User Info */}
              <div className="mb-4">
                <div className="font-bold text-slate-100 text-lg mb-2">{s.name}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{s.interests?.slice(0,4).join(', ')}</div>
              </div>

              {/* Average Score with Animation */}
              <div className="flex justify-center mb-4 flex-1 flex items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/50 hover:shadow-indigo-600/70 transition-all duration-500 group-hover:scale-110">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-30 animate-pulse"></div>
                    <div className="text-center z-10">
                      <span className="text-3xl font-black text-white">{userStats[s.id]?.avgScore || 0}</span>
                      <p className="text-xs text-indigo-200 font-semibold mt-0.5">Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button 
                  onClick={() => onViewProfile(s.id)} 
                  className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => toggleFav(s.id)} 
                  className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${user.favorites?.includes(s.id) ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`} 
                  aria-label="Toggle Favorite"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {user.favorites?.includes(s.id) ? 'Favorited' : 'Add Favorite'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
