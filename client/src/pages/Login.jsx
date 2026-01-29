import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiVideo } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    // Quick login for demo
    const quickLogin = async (role) => {
        const credentials = {
            admin: { email: 'admin@example.com', password: 'admin123' },
            editor: { email: 'editor@example.com', password: 'editor123' },
            viewer: { email: 'viewer@example.com', password: 'viewer123' }
        };

        setEmail(credentials[role].email);
        setPassword(credentials[role].password);
        setLoading(true);

        const result = await login(credentials[role].email, credentials[role].password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <FiVideo className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">StreamVault</h1>
                    <p className="text-gray-400 mt-2">Sign in to your account</p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner w-5 h-5"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="text-center text-gray-400 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Quick login buttons (for demo) */}
                <div className="mt-6">
                    <p className="text-center text-gray-500 text-sm mb-3">Quick Demo Login</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => quickLogin('admin')}
                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium
                       bg-purple-500/20 text-purple-400 border border-purple-500/30
                       hover:bg-purple-500/30 transition-colors"
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => quickLogin('editor')}
                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium
                       bg-blue-500/20 text-blue-400 border border-blue-500/30
                       hover:bg-blue-500/30 transition-colors"
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => quickLogin('viewer')}
                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium
                       bg-gray-500/20 text-gray-400 border border-gray-500/30
                       hover:bg-gray-500/30 transition-colors"
                        >
                            Viewer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
