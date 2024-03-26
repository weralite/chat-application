import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ENDPOINT = 'http://localhost:8080';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [contacts, setContacts] = useState([]); // Add function to set contacts via name
    const [chats, setChats] = useState([]); // Add function to set chats via name
    const [chatId, setChatId] = useState(null);
    const [senderId, setSenderId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const [receiver, setReceiver] = useState(''); // Add function to fetch name from recieverID
    const [sender, setSender] = useState(''); // Add function to fetch name from senderID
    const [activeChat, setActiveChat] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const userId = localStorage.getItem('userId');

    const chatEndRef = useRef(null); // Keeping track of the end of the chat

    const modalRef = useRef(null); // Keeping track of the modal



    // Handle contact click to enable a chat
    const handleContactClick = (contactId) => {
        // Set receiverId and senderId
        setReceiverId(contactId);
        setSenderId(userId);
        setModalVisible(false)
        if (socket) {
            socket.emit('get_chats', { senderId: userId, receiverId: contactId });

            socket.once('receive_chats', (chats) => {
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

    // Send message
    const sendMessage = (content) => {
        if (activeChat) {
            socket.emit('send_message', { chatId: activeChat.chatId, sender: userId, receiver: receiverId, content });
        }
    };

    // Update chats with new message
    const updateChatsWithNewMessage = (newMessage) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.chatId === newMessage.chatId) {
              return { ...chat, lastMessage: newMessage };
            } else {
              return chat;
            }
          });
        });
      };

    // Close modal when clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalVisible(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef]);

    // Retrieve token and username from local storage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            console.log('Token found:', storedToken);
            setToken(storedToken);
        }

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

    // Fetch all chats and last msg on mount
    useEffect(() => {
        // If socket is not yet initialized, return
        if (!socket) return;

        // Emit 'get_all_chats' event to fetch chats
        socket.emit('get_all_chats', { userId });

        // Listen for 'chats' event to receive chats from the server
        socket.on('chats', (chatsWithUsernamesAndLastMessage) => {
            console.log('Chats fetched:', chatsWithUsernamesAndLastMessage);
            setChats(chatsWithUsernamesAndLastMessage);
        });

        socket.on('message_received', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
          });
        
          socket.on('message_sent', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
          });

        // Cleanup on unmount
        return () => {
            socket.off('chats');
            socket.off('message_received');
            socket.off('message_sent');
            socket.off('error');
        };

    }, [socket, userId]);

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
            <div className='chat-wrapper'>
                <div className='chat-ongoing-chats'>
                    <p>chats</p>
                    {chats.map((chat, index) => (
                        <div key={index}>
                            <div><b>{chat.otherUsername}</b> <p>{chat.lastMessage.content}</p></div>

                        </div>
                    ))}
                    //// Add a function to display the chat history
                </div>
                <div className='chat-main-window'>
                    <h1>Chat Page</h1>
                    <div className='chat-primary-contacts'>
                        <h2 onClick={() => setModalVisible(true)}>Contacts</h2>
                    </div>
                    {isModalVisible && (
                        <div ref={modalRef} className={`contacts-modal ${isModalVisible ? 'visible' : ''}`}>
                            <div className='contacts-content'>
                                <ul>
                                    {contacts.map((contact) => (
                                        <li key={contact.id} onClick={() => handleContactClick(contact.id)}>{contact.username}</li>
                                    ))}
                                </ul>
                                <button onClick={() => setModalVisible(false)}>Close</button>
                            </div>
                        </div>
                    )}


                    <h2>Logged in as: {username}</h2>
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
