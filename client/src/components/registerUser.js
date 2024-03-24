import React, { useState } from 'react';
import axios from 'axios';

const RegisterUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/register', { username, password });
            console.log('Registration successful:', response.data);
            setUsername('');
            setPassword('');
        } catch (error) {
            console.log('Registration failed');
        }
    };


    return (
        <div className='chat-app'>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameInput}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordInput}
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterUser;