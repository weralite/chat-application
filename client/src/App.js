import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegisterUser from './components/registerUser';
import LoginUser from './components/loginUser';
import Chat from './components/chat/chat';
import io from 'socket.io-client';
import React, { useState, useEffect } from 'react';

const ENDPOINT = 'http://localhost:8080';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
          setToken(storedToken);
      }

      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
          setUsername(storedUsername);
      }
  }, []);

  useEffect(() => {
      if (token) {
          const userId = localStorage.getItem('userId');
          const newSocket = io(ENDPOINT, {
              query: { token, userId }
          });
          setSocket(newSocket);

          return () => {
              newSocket.disconnect();
          };
      }
  }, [token]);

  return (
    <>

        <Routes>
          <Route path="/" element={<LoginUser />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/chat" element={<Chat socket={socket} token={token} username={username} />} />
        </Routes>

    </>
  );
}

export default App;
