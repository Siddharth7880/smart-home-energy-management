import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Unauthorized.css';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <div className="error-icon">🚫</div>
                <h1>Access Denied</h1>
                <p className="error-message">
                    You don't have permission to access this page.
                </p>

                {user && (
                    <div className="user-info">
                        <p><strong>Your Current Role:</strong></p>
                        <div className="roles-display">
                            {user.roles && user.roles.length > 0 ? (
                                user.roles.map(role => (
                                    <span key={role} className="role-tag">
                                        {role.replace('ROLE_', '')}
                                    </span>
                                ))
                            ) : (
                                <p className="no-role">No roles assigned</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="help-section">
                    <h3>What You Can Do</h3>
                    <ul>
                        <li>Go back to the previous page</li>
                        <li>Return to your dashboard</li>
                        <li>Contact your administrator if you believe this is a mistake</li>
                    </ul>
                </div>

                <div className="action-buttons">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                    <button className="btn-home" onClick={() => navigate('/dashboard')}>
                        📊 Go to Dashboard
                    </button>
                </div>

                <div className="role-info">
                    <h4>Available Features by Role:</h4>
                    <div className="role-features">
                        <div className="feature-item">
                            <strong>👨‍💼 Admin</strong>
                            <p>User management, system settings, analytics</p>
                        </div>
                        <div className="feature-item">
                            <strong>🏠 Homeowner</strong>
                            <p>Device management, energy monitoring, control</p>
                        </div>
                        <div className="feature-item">
                            <strong>🔧 Technician</strong>
                            <p>Installation tracking, status updates, metrics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
