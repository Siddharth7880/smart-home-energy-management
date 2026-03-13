import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, AlertCircle } from 'lucide-react';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        // Check if there was an OAuth error
        if (error) {
            console.error('OAuth Error:', error);
            // Redirect to login with error message
            navigate('/login?error=' + encodeURIComponent(error) + '&type=oauth_error');
            return;
        }

        if (token) {
            // Store token
            localStorage.setItem('token', token);

            // Decode JWT to extract user info
            try {
                // JWT structure: header.payload.signature
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);

                // Extract user data from JWT payload
                const userData = {
                    accessToken: token,
                    username: payload.sub,
                    email: payload.sub,
                    roles: payload.roles || ['ROLE_HOMEOWNER'],
                };

                // Update auth context
                login(userData);

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                navigate('/login');
            }
        } else {
            // No token found, redirect to login
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
            <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg border"
                    style={{
                        background: `linear-gradient(to bottom right, var(--accent-color), var(--accent-hover))`,
                        borderColor: 'var(--accent-color)',
                        boxShadow: '0 10px 15px -3px rgba(var(--accent-color-rgb), 0.3)'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                    <Zap className="h-10 w-10 text-white drop-shadow-sm" />
                </motion.div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>
                    Authenticating...
                </h2>
                <p className="mt-2 text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>
                    Securing Your Session
                </p>
            </motion.div>
        </div>
    );
};

export default OAuthCallback;
