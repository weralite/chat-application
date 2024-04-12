import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUsername('');
        setPassword('');

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token);

             navigate('/chat');
            
        } catch (error) {
            console.log('Login failed:', error.response.data.message);
            setError(error.response.data.message);
        }
    };

    return (
        <div className='chat-app'>
            <h1>Login User</h1>
            
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={handleUsernameInput}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordInput}
                />
                <button type="submit">Login</button>
                {error && <p>{error}</p>
                }
            </form>
            <p>No account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

export default LoginUser;
