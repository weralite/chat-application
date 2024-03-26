import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ENDPOINT = 'http://localhost:8080';

const Chat = () => {
    const [messages, setMessages] = useState(''); // Forgot why this is here
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]); // Forgot why this is here
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [contacts, setContacts] = useState([]); // Add function to set contacts via name
    const [chatId, setChatId] = useState(null);
    const [senderId, setSenderId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const [receiver, setReceiver] = useState(''); // Add function to fetch name from recieverID
    const [sender, setSender] = useState(''); // Add function to fetch name from senderID
    const [activeChat, setActiveChat] = useState(null);

    const userId = localStorage.getItem('userId');
    const chatEndRef = useRef(null);



    // Handle contact click to enable a chat
    const handleContactClick = (contactId) => {
        // Set receiverId and senderId
        setReceiverId(contactId);
        setSenderId(userId);
        if (socket) {
            socket.emit('get_chats', { senderId: userId, receiverId: contactId });

            socket.once('receive_chats', (chats) => {
                console.log('Chats fetched:', chats);
                // Assuming chats is an array and the chat you're interested in is the first one
                const chatId = chats.chatId;
                setChatId(chatId); // Set chatId state
                setSender(chats.senderUsername);
                setReceiver(chats.receiverUsername);
                socket.emit('get_messages', { chatId });
            });
        }
        // Call chat.socket.controller function
        // Replace this with the actual function call
        // chat.socket.controller();
    };
    console.log('Contact clicked:', receiverId, senderId);

    console.log('User ID:', userId);

    console.log('Active chat:', activeChat);

    console.log('sender:', sender, 'receiver:', receiver)


    const sendMessage = (content) => {
        if (activeChat) {
            socket.emit('send_message', { chatId: activeChat.chatId, sender: userId, receiver: receiverId, content });
        }
    };

    // Retrieve token and username from local storage
    useEffect(() => {
        // Retrieve token from local storage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            console.log('Token found:', storedToken);
            setToken(storedToken);
        }

        // Retrieve username from local storage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            console.log('username found:', storedUsername);
            setUsername(storedUsername);
        }
    }, []);

    // Connect to Socket.IO server
    useEffect(() => {
        if (token) {
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
        }
    }, [token]);

    // Fetch contacts
    useEffect(() => {
        // If socket is not yet initialized, return
        if (!socket) return;

        // Emit 'get_contacts' event to fetch contacts
        socket.emit('get_contacts');

        // Listen for 'receive_contacts' event to receive contacts from the server
        socket.on('receive_contacts', (receivedContacts) => {
            console.log('Contacts fetched:', receivedContacts);
            // Filter contact IDs and usernames based on user ID
            const currentUserID = localStorage.getItem('userId');
            const contacts = receivedContacts.reduce((acc, contact) => {
                if (contact.user1Id !== currentUserID) {
                    acc.push({ id: contact.user1Id, username: contact.Username1 });
                } else if (contact.user2Id !== currentUserID) {
                    acc.push({ id: contact.user2Id, username: contact.Username2 });
                }
                return acc;
            }, []);
            // Remove duplicates based on id and set contacts to state
            const uniqueContacts = Array.from(new Set(contacts.map(c => c.id)))
                .map(id => contacts.find(c => c.id === id));
            setContacts(uniqueContacts);
        });
        
        // Cleanup on unmount
        return () => {
            socket.off('receive_contacts');
        };

    }, [socket]);

    // Listen for user connection and disconnection events
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

    // Listen for 'receive_chats' event to set an active chat
    useEffect(() => {
        if (token && socket) {
            // Listen for 'receive_chat' event
            socket.on('receive_chats', (chat) => {
                // Set active chat state here
                setActiveChat(chat);
            });
        }
    }, [token, socket]);

    // Recieve messages
    useEffect(() => {
        if (socket) {
            socket.on('receive_messages', (receivedMessages) => {
                setActiveChat(prevChat => {
                    console.log('Previous chat:', prevChat);
                    console.log('Received messages:', receivedMessages);
                    const newChat = {
                        ...prevChat,
                        messages: [...(prevChat?.messages || []), ...receivedMessages]
                    };
                    console.log('New chat:', newChat);
                    return newChat;
                });
            });
        }
    }, [socket]);

    // Send messages
    useEffect(() => {
        if (socket) {
            socket.on('message_sent', (newMessage) => {
                console.log('Message sent effect:', newMessage);
                setActiveChat(prevChat => {
                    console.log('Previous chat:', prevChat);
                    const newChat = {
                        ...prevChat,
                        messages: [...(prevChat?.messages || []), newMessage]
                    };
                    console.log('New chat:', newChat);
                    return newChat;
                });
            });

            return () => {
                socket.off('message_sent');
            };
        }
    }, [socket]);

    // Scroll to the end of the chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat]);

    return (
        <div className='chat-app'>
            <h1>Chat Page</h1>
            <h2>Logged in as: {username}</h2>
            <div className='chat-wrapper'>
                <div className='chat-primary-contacts'>
                    <h2>Contacts</h2>
                    <ul>
                        {contacts.map((contact) => (
                            <li key={contact.id} onClick={() => handleContactClick(contact.id)}>{contact.username}</li>
                        ))}
                    </ul>
                </div>
                <div className='chat-main-window'>
                    {activeChat && (
                        <>
                            <p>Chatting with {receiver}</p>
                            <div className='chat-textbox'>
                                {activeChat && activeChat.messages && (
                                    activeChat.messages.map((message, index) => (
                                        <div key={index}>
                                            <b>{message.sender.toString() === userId.toString() ? 'You' : receiver}</b>
                                            <p>{message.content}</p>
                                        </div>
                                    ))
                                )}
                                 <div ref={chatEndRef} />
                            </div>
                            <div className='input-and-send-box'>
                                <input
                                    className='chat-input-box'
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                                <button
                                    className='chat-send-button'
                                    onClick={() => {
                                        sendMessage(message);
                                        setMessage('');
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
