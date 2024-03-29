import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:8080';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // To store chat receipts
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
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [receiverOnline, setReceiverOnline] = useState(false);

    // console.log('Active chat:', activeChat);
    // console.log('Recieve messages', socket.listeners('receive_messages').length);
    // console.log('Get chats', socket.listeners('get_chats').length);
    // console.log('Get messages', socket.listeners('get_messages').length);
    // console.log('message_sent', socket.listeners('message_sent').length);
    // console.log('send_message', socket.listeners('send_message').length);
    // console.log('message_status_updated', socket.listeners('message_status_updated').length);
    // console.log('message_read', socket.listeners('message_read').length);
    // console.log('connectedUsers', socket.listeners('connectedUsers').length);
    // console.log('userConnected', socket.listeners('userConnected').length);
    // console.log('userDisconnected', socket.listeners('userDisconnected').length);
    // console.log('get_contacts', socket.listeners('get_contacts').length);
    // console.log('receive_contacts', socket.listeners('receive_contacts').length);
    // console.log('get_all_chats', socket.listeners('get_all_chats').length);
    // console.log('chats', socket.listeners('chats').length);
    // console.log('receive_chats', socket.listeners('receive_chats').length);
    // console.log('error', socket.listeners('error').length);




    const userId = localStorage.getItem('userId');

    const chatEndRef = useRef(null); // Keeping track of the end of the chat

    const modalRef = useRef(null); // Keeping track of the modal



    function handleMessageRead(messageId) {
        console.log('Emitting message_read event for message ID:', messageId);
        socket.emit('message_read', messageId);
    }

    const handleReceivedMessages = (messages) => {
        console.log('Received messages:', messages);
        // Process received messages
        if (messages) {
            messages.forEach((message) => {
                if (message.status !== 'read') {
                    handleMessageRead(message._id);
                    socket.emit('update_message_status', { messageId: message._id, status: 'read' });
                }
            });
        }
    };
    
    const handleReceiveChats = (chats) => {
        const chatId = chats.chatId;
        setChatId(chatId); // Set chatId state
        setSender(chats.senderUsername);
        setReceiver(chats.receiverUsername);
        socket.emit('get_messages', { chatId });
    
        // Listen for 'receive_messages' event
        socket.on('receive_messages', handleReceivedMessages);
    };
    
    const handleContactClick = (contactId) => {
        setReceiverId(contactId);
        setSenderId(userId);
        setModalVisible(false);
    
        if (!socket) return;
    
        socket.emit('get_chats', { senderId: userId, receiverId: contactId });
        socket.once('receive_chats', handleReceiveChats);
    };

    
    const openChatByChatId = (chatId, participants) => {
        const userId = localStorage.getItem('userId'); // Get the current user's ID
    
        // Determine sender and receiver IDs
        const senderId = userId;
        const receiverId = participants.find(id => id !== userId);
    
        if (socket) {
            // Emit 'get_chats' event with the senderId and receiverId
            socket.emit('get_chats', { senderId, receiverId });
    
            const onReceiveChats = (chats) => {
                // Assuming chats is an array and the chat you're interested in is the first one
                const chatId = chats.chatId;
                setChatId(chatId); // Set chatId state
                setSender(chats.senderUsername);
                setReceiver(chats.receiverUsername);
                socket.emit('get_messages', { chatId });
    
                // Remove the listener
                socket.off('receive_chats', onReceiveChats);
            };
    
            socket.once('receive_chats', onReceiveChats);
        }
    
        // Update sender and receiver states
        setSenderId(senderId);
        setReceiverId(receiverId);
    };

    // Send message
    const sendMessage = (content) => {
        if (activeChat) {
            const message = { chatId: activeChat.chatId, sender: userId, receiver: receiverId, content };
            socket.emit('send_message', message);
            updateChatsWithNewMessage([message]); // Pass the new message as an array
        }
    };
    // Update chats with new message
    const updateChatsWithNewMessage = (newMessages) => {
        if (newMessages.length > 0) {
            setChats((prevChats) => {
                return prevChats.map((chat) => {
                    const newMessage = newMessages.find((message) => message.chatId === chat.chatId);
                    if (newMessage) {
                        return {
                            ...chat,
                            lastMessage: newMessage
                        };
                    }
                    return chat;
                });
            });
        }
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
            setToken(storedToken);
        }

        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Connect to Socket.IO server
    useEffect(() => {
        if (token) {
            // Connect to Socket.IO server
            const userId = localStorage.getItem('userId');
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

    // Listen for connected users
    useEffect(() => {

        if (!socket) return;

        socket.on('connectedUsers', (users) => {
            // Handle the list of connected users received from the server
            setConnectedUsers(users);

            // Update the UI with the list of connected users
        });

        socket.on('userConnected', (users) => {
            // Handle the list of connected users received from the server
            setConnectedUsers(users);

            // Update the UI with the list of connected users
        });

        socket.on('userDisconnected', (users) => {
            // Handle the list of connected users received from the server
            setConnectedUsers(users);

            // Update the UI with the list of connected users
        });
    }, [socket]);

    // Check if receiver is online
    useEffect(() => {
        setReceiverOnline(connectedUsers.includes(receiverId));
    }, [connectedUsers, receiverId]);

    // Fetch contacts
    useEffect(() => {
        // If socket is not yet initialized, return
        if (socket) {
              // Emit 'get_contacts' event to fetch contacts
        socket.emit('get_contacts', userId);

        // Listen for 'receive_contacts' event to receive contacts from the server
        socket.on('receive_contacts', (receivedContacts) => {
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
        }
    }, [socket]);

    // Fetch all chats and last msg on mount
    useEffect(() => {
        // If socket is not yet initialized, return
        if (!socket) return;
    
        // Emit 'get_all_chats' event to fetch chats
        socket.emit('get_all_chats', { userId });
    
        // Listen for 'chats' event to receive chats from the server
        socket.on('chats', (chatsWithUsernamesAndLastMessage) => {
            const sortedChats = chatsWithUsernamesAndLastMessage.slice().sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
            setChats(sortedChats);
        });
    
        socket.on('receive_messages', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
            if (!chats.find(chat => chat.chatId === newMessage.chatId)) {
                // New chat ID detected, fetch chats again
                socket.emit('get_all_chats', { userId });
            }
        });
    
        socket.on('message_sent', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
            if (!chats.find(chat => chat.chatId === newMessage.chatId)) {
                // New chat ID detected, fetch chats again
                socket.emit('get_all_chats', { userId });
            }
        });
    
        // Cleanup on unmount
        return () => {
            socket.off('chats');
            socket.off('receive_messages');
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
                setActiveChat((prevChat) => {
                    // If there's no active chat, log a message to the console
                    if (!prevChat) {
                        console.log('prevChat is undefined');
                    }

                    // If there's no active chat or the received messages don't belong to the active chat, don't update the active chat
                    if (!prevChat || (receivedMessages && receivedMessages.length > 0 && receivedMessages[0].chatId !== prevChat.chatId)) {
                        return prevChat;
                    }

                    const newChat = {
                        ...prevChat,
                        messages: [...(prevChat?.messages || []), ...receivedMessages],
                    };
                    return newChat;
                });
            });
        }
    }, [socket]);

    // Send messages
    useEffect(() => {
        if (socket) {
            socket.on('message_sent', (newMessage) => {

                setActiveChat(prevChat => {

                    const newChat = {
                        ...prevChat,
                        messages: [...(prevChat?.messages || []), newMessage]
                    };

                    return newChat;
                });
            });

            return () => {
                socket.off('message_sent');
            };
        }
    }, [socket]);

    // Update message status
    useEffect(() => {
        // Listen for the 'message_sent' event
        if (socket) {
            socket.on('message_sent', (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        }

        // Listen for the 'receive_messages' event
        if (socket) {
            socket.on('receive_messages', (receivedMessages) => {
                setMessages(receivedMessages);
            });
        }

        // Listen for the 'message_status_updated' event
        if (socket) {
            socket.on('message_status_updated', (updatedMessage) => {
                console.log('Message status updated:', updatedMessage);
                setActiveChat((prevActiveChat) => {
                    if (prevActiveChat) {
                        const newActiveChat = {
                            ...prevActiveChat,
                            messages: prevActiveChat.messages.map((message) =>
                                message._id === updatedMessage._id ? updatedMessage : message
                            ),
                        };
                        return newActiveChat;
                    } else {
                        // Return some default state if prevActiveChat is null
                        return null;
                    }
                });
            });
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
                    {
                        chats
                            .slice()
                            .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
                            .map((chat) => (
                                <div key={chat.chatId} onClick={() => openChatByChatId(chat.chatId, Object.values(chat.participants))}>
                                    <div>
                                        <b>{chat.otherUsername}</b>
                                        <p>{chat.lastMessage.content}</p>
                                    </div>
                                </div>
                            ))
                    }
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
                            {receiverOnline ? (
                                <p>{receiver} is online</p>
                            ) : (
                                <p>{receiver} is offline</p>
                            )}
                            <div className='chat-textbox'>
                                {activeChat && activeChat.messages && (
                                    activeChat.messages.map((message, index) => (
                                        <div key={index}>
                                            <b>{message.sender.toString() === userId.toString() ? 'You' : receiver}</b>
                                            <p>{message.content}</p>
                                            <p>{message.status}</p>
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
