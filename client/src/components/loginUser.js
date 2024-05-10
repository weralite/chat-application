import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.style.css';

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
            setError(error.response.data.message);
        }
    };

    return (
        <div className='chat-app'>
            <div className='login-body'>
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            required={true}
                            onChange={handleUsernameInput}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            required={true}
                            onChange={handlePasswordInput}
                        />
                    </div>
                    <div className='button-box'>
                        <button type="submit">Login</button>
                    </div>
                    {error && <p>{error}</p>
                    }

                </form>
                <p>No account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
};

export default LoginUser;
