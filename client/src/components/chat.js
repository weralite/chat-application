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
    const [contacts, setContacts] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [senderId, setSenderId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);

    useEffect(() => {
        console.log('Token changed:', token);
    }, [token]);

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
        console.log('Sender ID:', senderId);
        console.log('Receiver ID:', receiverId);
    }, [senderId, receiverId]);

    useEffect(() => {
        // Connect to Socket.IO server
        const userId = localStorage.getItem('userId');
        console.log('Sending to socket:', token); // Add this line
        const newSocket = io(ENDPOINT, {
            query: { token, userId }
        });
        setSocket(newSocket);

        // Cleanup function to disconnect socket on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    useEffect(() => {
        if (token) {
            getContacts();
        }
    }, [token]);

    useEffect(() => {
        if (!socket) return;

        const handleUserConnected = (userId) => {
            setContacts(prevContacts => prevContacts.map(contact => {
                if (contact.id === userId) {
                    return { ...contact, connected: true };
                } else {
                    return contact;
                }
            }));
        };

        const handleUserDisconnected = (userId) => {
            setContacts(prevContacts => prevContacts.map(contact => {
                if (contact.id === userId) {
                    return { ...contact, connected: false };
                } else {
                    return contact;
                }
            }));
        };

        socket.on('userConnected', handleUserConnected);
        socket.on('userDisconnected', handleUserDisconnected);

        return () => {
            socket.off('userConnected', handleUserConnected);
            socket.off('userDisconnected', handleUserDisconnected);
        };
    }, [socket, contacts]);

    async function getContacts() {
        try {
            const userId = localStorage.getItem('userId');
            console.log('User ID:', userId);
            const response = await axios.get('http://localhost:8080/api/v1/contacts/getContactsForUser', {
                params: {
                    userId: userId
                }
            });
            console.log('Contacts:', response.data);

            // Add a 'connected' property to each contact
            const contacts = await Promise.all(response.data.map(async contact => {
                const isConnectedResponse = await axios.get(`http://localhost:8080/isUserConnected/${contact.id}`);
                return { ...contact, connected: isConnectedResponse.data };
            }));
            setContacts(contacts);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function createChat(contactId) {
        try {
            const userId = localStorage.getItem('userId');
            console.log(userId, contactId)
            const response = await axios.post('http://localhost:8080/api/v1/chats/createchat', {
                senderId: userId,
                receiverId: contactId
            });
            console.log('Chat created:', response.data);
            const chat = response.data;
            setChatId(chat.chatId);
            const [firstParticipant, secondParticipant] = chat.participants;
            setSenderId(firstParticipant === userId ? firstParticipant : secondParticipant);
            setReceiverId(firstParticipant === userId ? secondParticipant : firstParticipant);
        }
        catch (error) {
            console.error(error);
        }
    }


    async function sendMessage() {
        try {
            const response = await axios.post(`http://localhost:8080/api/v1/messages/sendMessage`, {
                senderId: senderId,
                receiverId: receiverId,
                content: message,
            });
            setMessage('');
            console.log('Message sent:', response.data);
        } catch (error) {
            console.error(error.message);
        }
    }


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
                        {contacts.map((contact, index) => (

                            <div className='chat-contact' key={index} onClick={() => createChat(contact.id)}>
                                <p>{contact.username}</p>
                                <p>Blocked: {contact.blocked ? 'Yes' : 'No'}</p>
                                <p>Connected: {contact.connected ? 'Yes' : 'No'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='chat-main-window'>
                    <div className='chat-textbox'>
                        {chatHistory.map((chat, index) => (
                            <>
                                <p>{username}</p>
                                <p key={index}>{chat}</p>
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
                        <button className='chat-send-button' onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;