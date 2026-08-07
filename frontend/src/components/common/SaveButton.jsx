import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export default function SaveButton({ module, postId, className = '' }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!user || !postId) return;
    try {
      const res = await api.get(`/saved/check/${module}/${postId}`);
      setSaved(res.data.saved);
    } catch {
      // ignore
    }
  }, [user, module, postId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const toggleSave = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (saved) {
        await api.delete(`/saved/${module}/${postId}`);
        setSaved(false);
      } else {
        await api.post('/saved', { module, post_id: Number(postId) });
        setSaved(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
        saved
          ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
      } ${className}`}
      title={saved ? 'Remove bookmark' : 'Bookmark this post'}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
      )}
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
