import React, { useState } from 'react';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            setChatHistory(prevChatHistory => [...prevChatHistory, message]);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Chat Page</h1>
            <div>
                {chatHistory.map((chat, index) => (
                    <>
                    <p>user</p>
                    <p key={index}>{chat}</p>
                    </>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default Chat;