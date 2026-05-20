import React, { useEffect, useState } from 'react';
import { Shield, UserX, Loader2 } from 'lucide-react';

export default function Deshboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 🔒 Security Check: Agar login karne wala banda admin hai, toh hi users list fetch karo
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://mernauth-backend-29ek.onrender.com/api/auth/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Kya aap sach me is user ko delete karna chahte hain?')) return;

    try {
      const response = await fetch(`https://mernauth-backend-29ek.onrender.com/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      // UI se delete huye user ko turant hata do
      setUsers(users.filter(u => u._id !== id));
      alert('User successfully deleted!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      {/* Upper Welcome Section */}
      <div className="max-w-5xl mx-auto bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-400 flex items-center gap-2">
            Welcome, {user?.name || 'User'}! 🎉
          </h1>
          <p className="text-slate-400 mt-1">Email: <span className="text-slate-200">{user?.email}</span></p>
          <p className="text-sm mt-2 flex items-center gap-1.5 text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded-full w-fit">
            <Shield className="w-4 h-4" /> Role: <span className="font-bold capitalize">{user?.role || 'user'}</span>
          </p>
        </div>
        
        <button 
          onClick={onLogout} 
          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-rose-950/20 w-full md:w-auto"
        >
          Log Out
        </button>
      </div>

      {/* 👑 ADMIN DASHBOARD PANEL (Sirf tabhi dikhega jab user.role === 'admin' hoga) */}
      {user?.role === 'admin' ? (
        <div className="max-w-5xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-xl font-bold text-white">User Management System</h2>
            <p className="text-xs text-slate-400 mt-1">Yahan se aap saare users ko dekh aur delete kar sakte hain.</p>
          </div>

          {error && (
            <p className="p-4 m-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-xl text-sm">{error}</p>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span>Users data load ho raha hai...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Koi users database me nahi mile.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-300 text-sm font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-sm text-slate-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{u.name}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {u._id !== user?.id && u.email !== user?.email ? (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="inline-flex items-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic font-medium bg-slate-900 px-2 py-1 rounded">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* 👤 Normal User Message (Agar role 'admin' nahi hai) */
        <div className="max-w-5xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
          <p className="text-lg">Aapka normal user account hai. Dashboard me naye updates jald hi aayenge! Thank you.</p>
        </div>
      )}
    </div>
  );
}