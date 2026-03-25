import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../MainLayout.js/MainLayout';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const StudentStaffLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiClient.post('/api/user/login', {
                username,
                password
            });

            const payload = res.data?.data;
            const { user, profile, token } = payload || {};
            
            login({ token, role: user?.role, user });
            localStorage.setItem('profile', JSON.stringify(profile));

            // Navigate based on user type
            if (user?.role === 'student') {
                navigate('/student-profile');
            } else if (user?.role === 'staff' || user?.role === 'hr') {
                navigate('/staff-profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout minimal>
        <div style={styles.container} className='bglog'>
            <div style={styles.loginCard}>
                <h2 style={styles.title}>LOGIN</h2>
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
        </MainLayout>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    loginCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '40px',
    borderRadius: '12px',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px',
    color: "#fff",
},
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#2c3e50',
        fontSize: '24px',
        color: "#fff",
    },
    error: {
        backgroundColor: '#ff6b6b',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: '14px'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.3s',
        background: "transparent",
        boxShadow: "-1px -1px 1px rgba(0, 0,0,0.3)",
        color: "#fff",
    },
   
    button: {
        padding: '12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    }
};

export default StudentStaffLogin;
