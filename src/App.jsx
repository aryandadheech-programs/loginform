import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

// 1. Dashboard Component
function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      <div className="text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-extrabold mb-4 text-indigo-400">Welcome! 🎉</h1>
        <p className="text-xl font-semibold text-white mb-2">This is your Dashboard</p>
        <p className="text-sm text-slate-400 mb-4">Next updates regarding to this is coming soon THANK YOU</p>
        
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-emerald-400 font-mono break-all text-center">
            Coming Soon
        </div>
        
        <button 
          onClick={onLogout} 
          className="mt-6 w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

// 2. Main App Component
export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [isLoggedInSuccessfully, setIsLoggedInSuccessfully] = useState(false);

  // 🔄 Strict Check: Sirf tabhi dashboard dikhao jab token physical roop se mojud ho
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== "undefined" && token !== null) {
      setIsLoggedInSuccessfully(true);
    } else {
      setIsLoggedInSuccessfully(false);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    let localErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isLogin && !formData.name.trim()) localErrors.name = 'Name is required';
    if (!formData.email) localErrors.email = 'Email address is required';
    else if (!emailRegex.test(formData.email)) localErrors.email = 'Please provide a valid email';
    if (!formData.password) localErrors.password = 'Password is required';
    else if (formData.password.length < 6) localErrors.password = 'Password must be at least 6 characters';
    
    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const baseURL = 'https://mernauth-backend-29ek.onrender.com';
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const validationErr = {};
          data.errors.forEach(err => validationErr[err.path] = err.msg);
          setErrors(validationErr);
          throw new Error('Validation failed');
        } else {
          throw new Error(data.message || 'Something went wrong');
        }
      }

      // Strict Login check
      const isLoginAction = isLogin || data.token;

      if (isLoginAction) {
        // 🔥 Sabse pehle token localstorage mein save hoga, fir redirection!
        if (data.token) {
          localStorage.setItem('token', data.token);
          
          setServerMessage({ type: 'success', text: 'Login successful! Syncing token...' });
          
          setTimeout(() => {
            setIsLoggedInSuccessfully(true); 
          }, 1000);
        } else {
          // Agar login ho gaya par backend ne token bheja hi nahi
          throw new Error("Backend responded without an auth token!");
        }
      } else {
        setServerMessage({ type: 'success', text: 'Account created successfully!' });
        setTimeout(() => {
          setIsLogin(true);
          setServerMessage({ type: '', text: '' });
        }, 1500);
      }
      
      setFormData({ name: '', email: '', password: '' });
      
    } catch (err) {
      if (err.message !== 'Validation failed') {
        setServerMessage({ type: 'error', text: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedInSuccessfully(false);
  };

  if (isLoggedInSuccessfully) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-sm text-slate-400 mt-2">{isLogin ? 'Sign in to access your dashboard' : 'Get started for free today'}</p>
        </div>

        {serverMessage.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${serverMessage.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/40 border-rose-500/30 text-rose-400'}`}>
            <span className="text-sm font-medium">{serverMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setErrors({}); setServerMessage({ type: '', text: '' }); }} className="text-indigo-400 hover:underline font-medium">
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}