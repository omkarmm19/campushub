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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-mono transition duration-150 ${
        saved
          ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]'
          : 'bg-[#17171A] border-[#26262B] text-[#8B8B92] hover:text-[#F2F2F3] hover:border-[#3A3A42]'
      } ${className}`}
      title={saved ? 'Remove bookmark' : 'Bookmark this post'}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Bookmark className={`h-3 w-3 ${saved ? 'fill-[#F5A623] text-[#F5A623]' : ''}`} />
      )}
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
