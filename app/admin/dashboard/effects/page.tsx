'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Loader2, Edit, Trash2, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EffectsManagementPage() {
  const [effects, setEffects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchEffects = async () => {
    try {
      const res = await fetch('/api/admin/effects');
      if (res.ok) {
        const data = await res.json();
        setEffects(data.effects || []);
      }
    } catch (err) {
      console.error('Failed to fetch effects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEffects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this effect?')) return;
    
    try {
      const res = await fetch(`/api/admin/effects/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEffects(effects.filter(e => e._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Error deleting effect');
      }
    } catch (err) {
      console.error('Error deleting effect', err);
    }
  };

  const filteredEffects = effects.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Effects Management</h1>
          <p className="text-zinc-400 mt-1 pb-2">Create, edit, and manage code effects / components.</p>
        </div>
        <Link
          href="/admin/dashboard/effects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-all shadow-lg shadow-indigo-500/25 active:scale-95 whitespace-nowrap mb-2"
        >
          <Plus className="w-4 h-4" />
          Add New Effect
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-md overflow-hidden relative"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search effects by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/5 text-xs uppercase text-zinc-500 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl">Effect Details</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 hidden sm:table-cell">Created</th>
                <th scope="col" className="px-6 py-4 text-right rounded-tr">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEffects.map((effect) => (
                <tr 
                  key={effect._id} 
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 overflow-hidden">
                        {effect.previewImage ? (
                          <img src={effect.previewImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Code2 className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200">{effect.title}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{effect.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {effect.isPublished ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-xs border border-green-500/20 font-medium">
                        <div className="w-1.5 h-1.5 rounded bg-green-500" />
                        Published
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20 font-medium">
                        <div className="w-1.5 h-1.5 rounded bg-yellow-500" />
                        Draft
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {new Date(effect.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Link
                          href={`/admin/dashboard/effects/${effect._id}`}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(effect._id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEffects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <p>No effects found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
