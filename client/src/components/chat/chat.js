import React, { useState, useEffect, useRef } from 'react';
import ChatList from './chatList';
import ContactsModal from './contactsModal';
import ChatArea from './chatArea';


const Chat = ({ socket, token, username }) => {
    const [message, setMessage] = useState('');
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
    const userId = localStorage.getItem('userId');
    const chatEndRef = useRef(null); // Keeping track of the end of the chat
    const modalRef = useRef(null); // Keeping track of the modal



    // Emit 'message_read' event to mark a message as read
    const handleMessageRead = (messageId) => {
        socket.emit('message_read', messageId);
    }

    const handleReceivedMessages = (message) => {
        // Process received message
        if (message) {
            // updateChatsWithNewMessage([message]);
            const userId = localStorage.getItem('userId'); // Get the current user's ID
            // Only mark the message as read if the current user is the receiver
            if (message.status !== 'read' && message.receiver === userId) {
                handleMessageRead(message._id);
            }
        }
    };

    // Send message
    const sendMessage = (content) => {
        if (activeChat) {
            const message = { chatId: activeChat.chatId, sender: userId, receiver: receiverId, content };
            socket.emit('send_message', message);
            // updateChatsWithNewMessage([message]); 
        }
    };

    const handleContactClick = (contactId) => {
        const userId = localStorage.getItem('userId'); // Get the current user's ID
        const senderId = userId;
        const receiverId = contactId;


        setModalVisible(false);

        if (socket) {
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
        setSenderId(senderId);
        setReceiverId(receiverId);
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

    // Gets chatlist of usernames and last message for logged in user
    useEffect(() => {
        // If socket is not yet initialized, return
        if (!socket) return;

        // Emit 'get_all_chats' event to fetch chats
        socket.emit('get_all_chats', { userId });
        // Listen for 'chats' event to receive chats from the server
        socket.on('chats', (chatsWithUsernamesAndLastMessage) => {
            console.log('chatsWithUsernamesAndLastMessage', chatsWithUsernamesAndLastMessage);
            const sortedChats = chatsWithUsernamesAndLastMessage.slice().sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
            setChats(sortedChats);
        });

        socket.on('receive_messages', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
            console.log('non-active effect received', newMessage);
            if (!chats.find(chat => chat.chatId === newMessage.chatId)) {
                // New chat ID detected, fetch chats again
                socket.emit('get_all_chats', { userId });
            }
        });

        socket.on('message_sent', (newMessage) => {
            updateChatsWithNewMessage(newMessage);
            console.log('non-active effect sent', newMessage);
            if (!chats.find(chat => chat.chatId === newMessage.chatId)) {
                console.log('newMessage SENT', newMessage);
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

    // Activates a chat when a chat is received from get_chats request
    useEffect(() => {
        if (token && socket) {
            // Listen for 'receive_chat' event
            socket.on('receive_chats', (chat) => {
                // Set active chat state here
                setActiveChat(chat);
            });
        }
    }, [token, socket]);

    // Update the active chat with received messages and message receipts
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('receive_messages', (receivedMessages) => {
                setActiveChat((prevChat) => {
                    // If there's no active chat, log a message to the console
                    if (!prevChat) {
                        console.log('prevChat is undefined');
                    }

                    // When recieving a chat from a non active chat, do not force open the chat.
                    if (!prevChat || (receivedMessages && receivedMessages.length > 0 && receivedMessages[0].chatId !== prevChat.chatId)) {
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
                socket.off('receive_messages');
            };
        }
    }, [socket, activeChat, handleReceivedMessages]);

    // Update the active chat with sent messages
    useEffect(() => {
        if (socket && activeChat) {
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
    }, [socket, activeChat]);

    // Update the active chat with updated message status
    useEffect(() => {
        if (socket && activeChat) {
            socket.on('message_status_updated', (updatedMessage) => {
                setActiveChat(prevChat => {
                    // If there's no active chat, log a message to the console
                    if (!prevChat) {
                        console.log('prevChat is undefined');
                    }

                    // When recieving a chat from a non active chat, do not force open an active chat.
                    if (!prevChat || (updatedMessage && updatedMessage.chatId !== prevChat.chatId)) {
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

    // Scroll to the end of the chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat]);

    return (
        <div className='chat-app'>
            <div className='chat-wrapper'>

                <ChatList chats={chats} openChatByChatId={openChatByChatId} />

                <div className='chat-main-window'>
                    <h1>Chat</h1>
                    <div className='chat-primary-contacts'>
                        <h2 onClick={() => setModalVisible(true)}>Contacts</h2>
                    </div>
                    <ContactsModal
                        contacts={contacts}
                        modalRef={modalRef}
                        isModalVisible={isModalVisible}
                        handleContactClick={handleContactClick}
                        setModalVisible={setModalVisible}
                    />

                    <h2>Logged in as: {username}</h2>

                    {activeChat && (
                        <ChatArea
                            activeChat={activeChat}
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
