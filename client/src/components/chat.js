import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ENDPOINT = 'http://localhost:8080';

const Chat = () => {
    const [message, setMessage] = useState(''); 
    const [chatHistory, setChatHistory] = useState([]); 
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Retrieve token from local storage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            console.log('Token found:', storedToken);
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        // Retrieve token from local storage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            console.log('username found:', storedUsername);
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        // Connect to Socket.IO server
        const newSocket = io(ENDPOINT, {
            query: { token, username }
        });
        setSocket(newSocket);

        // Cleanup function to disconnect socket on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            // Send the message to the server along with the token
            socket.emit('sendMessage', { message, token });
            // Update the chat history to include the new message
            setChatHistory(prevChatHistory => [...prevChatHistory, message]);
            setMessage('');
        }
    };
    
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/chat', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setChatHistory(response.data);
            } catch (error) {
                console.error(error);
            }
        };
    
        fetchMessages();
    }, []);

    return (
        <div className='chat-app'>
            <h1>Chat Page</h1>
            <select className='contact-select'>
                <option value="">Add contact</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Doe">Jane Doe</option>
                <option value="John Smith">John Smith</option>
            </select>
            <div className='chat-wrapper'>
                <div className='chat-primary-contacts'>

                    <h2>Contacts</h2>

                    <div className='chat-contacts-list'>
                        <p>Abdulla</p>

                    </div>

                </div>

                <div className='chat-main-window'>

                    {/* <h2>Chat Page</h2> */}

                    <div className='chat-textbox'>
                        <b>Ahmed </b>
                        <p>shoo brosh </p>
                        <b>Abdulla </b>
                        <p>shooooo </p>


                        {chatHistory.map((chat, index) => (
                            <>
                                <p>{username}</p>
                                <p key={index}>{chat}</p>
                                <p>test </p>
                            </>
                        ))}
                    </div>
                    <div className='input-and-send-box'>
                    <input
                        className='chat-input-box'
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                    <button className='chat-send-button' onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;