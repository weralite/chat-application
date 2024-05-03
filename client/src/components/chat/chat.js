import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import io from 'socket.io-client';
import ChatList from './chatList';
import MenuModal from '../menuModal';
import ChatField from './chatField';


const ENDPOINT = 'http://localhost:8080';



const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState('');
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [receiverId, setReceiverId] = useState(null); // Storing receiver ID
    const [receiverOnline, setReceiverOnline] = useState(false);
    const [receiver, setReceiver] = useState(''); // Add function to fetch name from recieverID
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [contacts, setContacts] = useState([]);
    const [chats, setChats] = useState([]); // Used for setting a chat as active
    const [chatList, setChatList] = useState([]); // Used for listing all chats with usernames and last message
    const [activeChat, setActiveChat] = useState(null); // Keep track of which chat is currently open
    const [isModalVisible, setModalVisible] = useState(false);

    const chatEndRef = useRef(null); // Keeping track of the end of the chat

    const modalRef = useRef(null); // Keeping track of the modal

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/contacts/getContacts`, {
                params: { userId: userId }
            });

            const contacts = response.data
            setContacts(contacts)
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    // Function to emit message_read event to server
    const handleMessageRead = (messageId) => {
        socket.emit('message_read', messageId);
    }

    // Function to separete received messages from sent messages
    const handleReceivedMessages = (message) => {
        // Process received message
        if (message) {
            // Only mark the message as read if the current user is the receiver
            if (message.status !== 'read' && message.receiver === userId) {
                handleMessageRead(message._id);
            }
        }
    };

    // Function to send messages
    const sendMessage = (content) => {
        if (activeChat) {
            const message = { chatId: activeChat._id, sender: userId, receiver: receiverId, content };
            socket.emit('send_message', message);
            updateChatsWithNewMessage([message]);
        }
    };

    // Function to activate chat when a contact is clicked
    const handleContactClick = (contactId) => {
        const senderId = userId;
        const receiverId = contactId;


        setModalVisible(false);

        if (socket) {
            socket.emit('get_chats', { senderId, receiverId });

            const onReceiveChats = (chats) => {
                // Assuming chats is an array and the chat you're interested in is the first one
                const chatId = chats._id;
                setReceiver(chats.receiverUsername);
                socket.emit('get_messages', { chatId });

                // Remove the listener
                socket.off('receive_chats', onReceiveChats);
            };

            socket.once('receive_chats', onReceiveChats);
        }
        setReceiverId(receiverId);
    };

    // Function to activate chat when a chat is clicked
    const openChatByChatId = (chatId, participants) => {
        // Determine sender and receiver IDs
        const senderId = userId;
        const receiverId = participants.find(id => id !== userId);

        if (socket) {
            // Emit 'get_chats' event with the senderId and receiverId
            socket.emit('get_chats', { senderId, receiverId });

            const onReceiveChats = (chats) => {
                // Assuming chats is an array and the chat you're interested in is the first one
                const chatId = chats._id;
                setReceiver(chats.receiverUsername);
                socket.emit('get_messages', { chatId });

                // Remove the listener
                socket.off('receive_chats', onReceiveChats);
            };

            socket.once('receive_chats', onReceiveChats);
        }

        // Update sender and receiver states
        setReceiverId(receiverId);
    };

    // Function to update active chat with messages
    const updateChatsWithNewMessage = (newMessages) => {
        if (newMessages.length > 0) {
            setChats((prevChats) => {
                return prevChats.map((chat) => {
                    const newMessage = newMessages.find((message) => message.chatId === chat._id);
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

    // Decode token and set user ID and username
    useEffect(() => {
        const decodeToken = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
                setUsername(decoded.username);
                setToken(token);
            }
        };

        decodeToken();

        window.addEventListener('storage', decodeToken);
        return () => {
            window.removeEventListener('storage', decodeToken);
        };
    }, [userId, setUserId, setToken]);

    // Connect to Socket.IO server
    useEffect(() => {
        if (token) {
            const newSocket = io(ENDPOINT, {
                query: { token, userId }
            });
            setSocket(newSocket);

            // Cleanup function to disconnect socket on unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [token, userId]);

    // Listen for connected users
    useEffect(() => {

        if (!socket) return;

        socket.on('connectedUsers', (users, socketId) => {
            setConnectedUsers(users, socketId);
        });
        socket.on('userConnected', (users) => {
            socket.emit('userConnected', userId);
            setConnectedUsers(users);
        });

        socket.on('userDisconnected', (users) => {
            setConnectedUsers(users);
        });
    }, [socket]);

    // Check if receiver is online
    useEffect(() => {
        setReceiverOnline(connectedUsers.includes(receiverId));
    }, [connectedUsers, receiverId]);

    // Effect for the initial fetching of a users chatlist with usernames and last message
    useEffect(() => {
        if (!socket) return;

        const handleChats = (chatsWithUsernamesAndLastMessage) => {
            setChatList(chatsWithUsernamesAndLastMessage);
        };

        socket.emit('get_all_chats', { userId });
        socket.on('chats', handleChats);

        return () => {
            socket.off('chats', handleChats);
        };
    }, [socket, userId]);

    // Effect for continued updates to the chatlist
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessages = (newMessage) => {
            updateChatsWithNewMessage(newMessage);
            if (newMessage.length > 0) {
                socket.emit('get_all_chats', { userId });
            }
        };

        socket.on('message', handleReceiveMessages);

        return () => {
            socket.off('message', handleReceiveMessages);
        };
    }, [socket, userId, chats, updateChatsWithNewMessage]);

    // Effect for updating chat list when user is blocked/unblocked
    useEffect(() => {
        if (socket) {
            socket.on('requestChatUpdate', ({ blockedUserId }) => {

                // Check if the active chat contains the blocked user ID
                const containsBlockedUser = activeChat && activeChat.participants.includes(blockedUserId);

                if (containsBlockedUser) {
                    setActiveChat(null);
                }
                // Fetch updated chats for the current user
                socket.emit('get_all_chats', { userId });
            });
        }
    }, [socket, userId, activeChat]);

    // Activates a chat when a chat is received from get_chats request
    useEffect(() => {
        if (token && socket) {
            socket.on('receive_chats', (chat) => {
                setActiveChat(chat);
            });
        }
    }, [token, socket]);

    // Update the active chat with messages
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('message', (receivedMessages) => {
                setActiveChat((prevChat) => {

                    // If there's no active chat, do nothing
                    if (!prevChat) {
                        return prevChat;
                    }

                    // When recieving a chat from a non active chat, do not force open the chat.
                    if (!prevChat || (receivedMessages && receivedMessages.length > 0 && receivedMessages[0].chatId !== prevChat._id)) {
                        return prevChat;
                    }

                    // If there's an active chat, append the received messages to the chat
                    const newChat = {
                        ...prevChat,
                        messages: [...(prevChat?.messages || []), ...receivedMessages],
                    };

                    // Call handleReceivedMessages for each received message
                    receivedMessages.forEach(handleReceivedMessages);
                    return newChat;
                });
            });
            return () => {
                socket.off('message');
            };
        }
    }, [socket, activeChat, handleReceivedMessages]);

    // Update the active chat with updated message status
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('message_status_updated', (updatedMessage) => {
                setActiveChat(prevChat => {
                    // If there's no active chat, log a message to the console
                    if (!prevChat) {
                        return prevChat;
                    }

                    // When recieving a chat from a non active chat, do not force open an active chat.
                    if (!prevChat || (updatedMessage && updatedMessage.chatId !== prevChat._id)) {
                        return prevChat;
                    }

                    const newChat = {
                        ...prevChat,
                        messages: prevChat.messages.map(message => {
                            if (message._id === updatedMessage._id) {
                                return updatedMessage;
                            }
                            return message;
                        })
                    };
                    return newChat;
                });
            });

            return () => {
                socket.off('message_status_updated');

            };
        }
    }, [socket, activeChat]);

    // Update the chat list when a chat is deleted
    useEffect(() => {
        let isMounted = true; // Flag to track if component is mounted
    
        if (socket) {
            socket.on('chatDeleted', (chatId) => {
                if (isMounted) {
                    setChatList(prevChatList => {
                        return prevChatList.filter(chat => chat._id !== chatId);
                    });
                }
            });
    
            return () => {
                isMounted = false; // Cleanup flag when component is unmounted
                socket.off('chatDeleted');
            };
        }
    }, [chatList]);


    // Update the active chat state when a chat is deleted
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('chatDeleted', (chatId) => {
                if (activeChat && chatId === activeChat._id) {
                    setActiveChat(null);
                }
            });

            return () => {
                socket.off('chatDeleted');
            };
        }
    }, [chatList, activeChat]);

    // Update the chatlist when a message is deleted
    useEffect(() => {
        if (socket) {
            socket.on('messageDeleted', () => {
                socket.emit('get_all_chats', { userId });
            });

            return () => {
                socket.off('messageDeleted');
            };
        }
    }, [socket]);


    // Update the active chat state when a message is deleted
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('messageDeleted', (messageId) => {
                const updatedMessages = activeChat.messages.filter(message => message._id !== messageId);
                setActiveChat({
                    ...activeChat,
                    messages: updatedMessages,
                });
                socket.emit('get_all_chats', { userId });
            });

            return () => {
                socket.off('messageDeleted');
            };
        }
    }, [socket, activeChat]);

    // Scroll to the end of the chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat]);

    // Close menu modal when clicked outside
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

    return (
        <div className='chat-app'>
            <div className='chat-wrapper'>
                <div className="menu-container">
                    <MenuModal
                        userId={userId}
                        username={username}
                        contacts={contacts}
                        socket={socket}
                        chatList={chatList}
                        fetchContacts={fetchContacts}
                        setChatList={setChatList}
                        setContacts={setContacts}
                        setActiveChat={setActiveChat}
                        modalRef={modalRef}
                        isModalVisible={isModalVisible}
                        handleContactClick={handleContactClick}
                        setModalVisible={setModalVisible}
                    />

                    <button className="hamburger-button" onClick={() => {
                        setModalVisible(true);
                        fetchContacts();
                    }}>
                        ☰
                    </button>
                </div>

                <ChatList
                    socket={socket}
                    setChatList={setChatList}
                    chatList={chatList}
                    setActiveChat={setActiveChat}
                    activeChat={activeChat}
                    openChatByChatId={openChatByChatId}
                    userId={userId}
                />

                <div className='chat-main-window'>
                    {activeChat && (
                        <ChatField
                            socket={socket}
                            activeChat={activeChat}
                            setActiveChat={setActiveChat}
                            receiver={receiver}
                            receiverOnline={receiverOnline}
                            userId={userId}
                            message={message}
                            setMessage={setMessage}
                            sendMessage={sendMessage}
                            chatEndRef={chatEndRef}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
