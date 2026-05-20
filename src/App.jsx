import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import Deshboard from './Deshboard';

export default function App() {

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const [serverMessage, setServerMessage] = useState({
    type: '',
    text: ''
  });

  const [loading, setLoading] = useState(false);

  const [isLoggedInSuccessfully, setIsLoggedInSuccessfully] =
    useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);

  // INPUT CHANGE
  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // VALIDATION
  const validateForm = () => {

    let localErrors = {};

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && !formData.name.trim()) {
      localErrors.name = 'Name is required';
    }

    if (!formData.email) {
      localErrors.email = 'Email is required';

    } else if (!emailRegex.test(formData.email)) {
      localErrors.email = 'Invalid email';
    }

    if (!formData.password) {
      localErrors.password = 'Password is required';

    } else if (formData.password.length < 6) {
      localErrors.password =
        'Password minimum 6 characters';
    }

    setErrors(localErrors);

    return Object.keys(localErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    setServerMessage({
      type: '',
      text: ''
    });

    if (!validateForm()) return;

    setLoading(true);

    const endpoint =
      isLogin
        ? '/api/auth/login'
        : '/api/auth/signup';

    const baseURL =
      'https://mernauth-backend-29ek.onrender.com';

    try {

      const response = await fetch(
        `${baseURL}${endpoint}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      console.log("SERVER RESPONSE:", data);

      if (!response.ok) {

        if (data.errors) {

          const validationErr = {};

          data.errors.forEach(err => {
            validationErr[err.path] = err.msg;
          });

          setErrors(validationErr);

          throw new Error('Validation failed');

        } else {

          throw new Error(
            data.message || 'Something went wrong'
          );
        }
      }

      // LOGIN
      if (isLogin) {

        if (
          data.token &&
          typeof data.token === 'string'
        ) {

          localStorage.removeItem('token');

          localStorage.setItem(
            'token',
            data.token
          );

          console.log(
            "TOKEN SAVED:",
            data.token
          );

        } else {

          console.log("TOKEN NOT FOUND");
        }

        setLoggedInUser(data.user);

        setServerMessage({
          type: 'success',
          text: 'Login successful!'
        });

        setFormData({
          name: '',
          email: '',
          password: ''
        });

        setTimeout(() => {

          setIsLoggedInSuccessfully(true);

        }, 1000);

      } else {

        // SIGNUP
        setServerMessage({
          type: 'success',
          text: 'Account created successfully!'
        });

        setFormData({
          name: '',
          email: '',
          password: ''
        });

        setTimeout(() => {

          setIsLogin(true);

          setServerMessage({
            type: '',
            text: ''
          });

        }, 2000);
      }

    } catch (error) {

      console.log(error);

      if (error.message !== 'Validation failed') {

        setServerMessage({
          type: 'error',
          text: error.message
        });
      }

    } finally {

      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem('token');

    setLoggedInUser(null);

    setIsLoggedInSuccessfully(false);

    setServerMessage({
      type: '',
      text: ''
    });
  };

  // DASHBOARD
  if (isLoggedInSuccessfully) {
    return (
      <Deshboard
        user={loggedInUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">

      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">

        {/* HEADING */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-extrabold text-white">

            {isLogin
              ? 'Welcome Back'
              : 'Create Account'}

          </h2>

          <p className="text-sm text-slate-400 mt-2">

            {isLogin
              ? 'Sign in to continue'
              : 'Create your free account'}

          </p>
        </div>

        {/* SERVER MESSAGE */}
        {serverMessage.text && (

          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
              serverMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >

            {serverMessage.type === 'success'
              ? <CheckCircle2 className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />
            }

            <span className="text-sm font-medium">
              {serverMessage.text}
            </span>

          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* NAME */}
          {!isLogin && (

            <div>

              <label className="block text-sm text-slate-300 mb-1.5">

                Full Name

              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">

                  <User className="w-5 h-5" />

                </div>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full bg-slate-900 border ${
                    errors.name
                      ? 'border-rose-500'
                      : 'border-slate-700'
                  } rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />

              </div>

              {errors.name && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* EMAIL */}
          <div>

            <label className="block text-sm text-slate-300 mb-1.5">
              Email
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">

                <Mail className="w-5 h-5" />

              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`w-full bg-slate-900 border ${
                  errors.email
                    ? 'border-rose-500'
                    : 'border-slate-700'
                } rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />

            </div>

            {errors.email && (
              <p className="text-xs text-rose-400 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>

            <label className="block text-sm text-slate-300 mb-1.5">
              Password
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">

                <Lock className="w-5 h-5" />

              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full bg-slate-900 border ${
                  errors.password
                    ? 'border-rose-500'
                    : 'border-slate-700'
                } rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
              >

                {showPassword
                  ? <EyeOff className="w-5 h-5" />
                  : <Eye className="w-5 h-5" />
                }

              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-rose-400 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >

            {loading
              ? 'Processing...'
              : isLogin
                ? 'Sign In'
                : 'Sign Up'
            }

          </button>
        </form>

        {/* TOGGLE */}
        <div className="mt-6 text-center">

          <p className="text-sm text-slate-400">

            {isLogin
              ? "Don't have an account?"
              : 'Already have an account?'
            }

            <button
              onClick={() => {

                setIsLogin(!isLogin);

                setErrors({});

                setServerMessage({
                  type: '',
                  text: ''
                });

              }}
              className="ml-1 text-indigo-400 hover:underline"
            >

              {isLogin
                ? 'Create one'
                : 'Sign In'
              }

            </button>
          </p>
        </div>
      </div>
    </div>
  );
}