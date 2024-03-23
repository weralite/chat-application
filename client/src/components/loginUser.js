import React, { useState } from 'react';
import axios from 'axios';

const LoginUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token); // Store token in localStorage
            localStorage.setItem('username', username); // Store username in localStorage
            // Redirect to the chat page
            window.location.href = "http://localhost:3000/chat";
            console.log('Login successful:', response.data);
            // Optionally, you can perform additional actions after successful login, such as redirecting the user to another page
        } catch (error) {
            console.log('Login failed:', error.response.data.message);
            setError(error.response.data.message);
        }
    };

    return (
        <div>
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
            </form>
        </div>
    );
};

export default LoginUser;
