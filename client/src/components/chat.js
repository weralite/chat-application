import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:8000';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
      // Connect to Socket.IO server
      const newSocket = io(ENDPOINT);
      setSocket(newSocket);
  
      // Cleanup function to disconnect socket on unmount
      return () => {
        newSocket.disconnect();
      };
    }, []);


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