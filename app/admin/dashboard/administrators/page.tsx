'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Loader2, User, Search, X } from 'lucide-react';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({ name: '', email: '', password: '' });
    setIsEditMode(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminUser) => {
    setFormData({ name: admin.name, email: admin.email, password: '' });
    setSelectedAdminId(admin._id);
    setIsEditMode(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete yourself.');
      return;
    }

    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const res = await fetch(`/api/admin/users/\${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAdmins(admins.filter((a) => a._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      let res;
      if (isEditMode && selectedAdminId) {
        // Validation for Edit
        const bodyContent: any = { name: formData.name };
        if (formData.password) bodyContent.password = formData.password;

        res = await fetch(`/api/admin/users/\${selectedAdminId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent),
        });
      } else {
        // Create
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        setFormError(data.message || 'An error occurred');
      } else {
        setIsModalOpen(false);
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Access Management</h1>
          <p className="text-zinc-400 mt-1 pb-2">Manage administrator accounts and system access privileges.</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-all shadow-lg shadow-indigo-500/25 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Administrator
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-md overflow-hidden shadow-xl">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/30">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search administrators by name or email..."
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
                  <th scope="col" className="px-6 py-4 rounded-tl">Administrator Details</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 hidden sm:table-cell">Joined</th>
                  <th scope="col" className="px-6 py-4 text-right rounded-tr">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAdmins.map((admin) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={admin._id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{admin.name}</div>
                          <div className="text-zinc-500 text-xs mt-0.5">{admin.email} {currentUser?.id === admin._id && <span className="text-indigo-400 font-medium ml-1">(You)</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {new Date(admin.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== admin._id && (
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center">
                        <UsersIcon className="w-10 h-10 text-zinc-700 mb-3" />
                        <p>No administrators found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-md shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-white">
                  {isEditMode ? 'Edit Administrator' : 'Create New Administrator'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email Address</label>
                    <input
                      required={!isEditMode}
                      disabled={isEditMode}
                      type="email"
                      className={`w-full bg-black/50 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm \${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="admin@codophile.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                      Password {isEditMode && <span className="text-zinc-600 font-normal">(Leave blank to keep current)</span>}
                    </label>
                    <input
                      required={!isEditMode}
                      type="password"
                      className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-md border border-white/10 text-zinc-300 hover:bg-white/5 transition-all font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/25 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isEditMode ? 'Save Changes' : 'Create Administrator'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const UsersIcon = ({ className }: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
