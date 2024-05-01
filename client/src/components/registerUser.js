import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/register.style.css';

const RegisterUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/users/register', { username, password });
            setUsername('');
            setPassword('');
            navigate('/');
        } catch (error) {
            console.log('Registration failed');
        }
    };

    const exitForm = () => {
        navigate('/');
    }

    return (
        <div className='chat-app'>
            <div className='registration-body'>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        placeholder='Username'
                        required={true}
                        onChange={handleUsernameInput}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        placeholder='Password'
                        required={true}
                        onChange={handlePasswordInput}
                    />
                </div>
                <div className='button-box'>
                <button onClick={exitForm}>Back</button>
                <button type="submit">Register</button>
                </div>
            </form>
            </div>
        </div>
    );
};

export default RegisterUser;