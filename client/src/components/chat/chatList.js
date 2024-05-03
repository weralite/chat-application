import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatList = ({ chatList, openChatByChatId, userId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deliveredMessagesCount, setDeliveredMessagesCount] = useState({});
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [selectedChat, setSelectedChat] = useState(null);

    const contextMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                // Click was outside the context menu, close it
                setContextMenu(prevState => ({ ...prevState, visible: false }));
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        chatList.forEach(chat => {
            const url = `http://localhost:8080/api/v1/messages/getMessages/${chat._id}`;

            axios.get(url)
                .then(response => {
                    const data = response.data;
                    const count = data.filter(message => message.receiver === userId).length;
                    setDeliveredMessagesCount(prevState => ({
                        ...prevState,
                        [chat._id]: count
                    }));
                })
                .catch(error => console.error('Error:', error));
        });
    }, [chatList, userId]);

    const sortedChats = chatList.slice().sort((a, b) => {
        const lastMessageA = a.lastMessage;
        const lastMessageB = b.lastMessage;

        // Ensure that lastMessage exists for both chats
        if (!lastMessageA || !lastMessageB) return 0;

        return new Date(lastMessageB.createdAt) - new Date(lastMessageA.createdAt);
    });

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleContextMenu = (event, chat) => {
        event.preventDefault();
        setSelectedChat(chat);
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
    };

    const handleClick = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleDeleteChat = (chat) => {
        console.log(chat);
        setContextMenu({ visible: false, x: 0, y: 0 });
    }


    return (
        <div className='chat-ongoing-chats'>
            <div className='chatlist-header'>
                <input
                    className='find-chat-input'
                    type='text'
                    placeholder='Search'
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            {
                sortedChats
                    .filter(chat => {
                        const otherUsername = chat.otherUsername || '';
                        return otherUsername.toLowerCase().includes((searchTerm || '').toLowerCase());
                    })
                    .map((chat) => (
                        <div
                            key={chat._id}
                            onClick={(event) => {
                                openChatByChatId(chat._id, Object.values(chat.participants));
                                handleClick(event);
                            }}
                            onContextMenu={(event) => handleContextMenu(event, chat)}
                        >
                            <div className='chatlist-chatrow'>
                                <div className='chatrow-left'>
                                    <b>{chat.otherUsername}</b>
                                    <p className='paragraph'>
                                        {chat.lastMessage.content && chat.lastMessage.content.length > 20
                                            ? `${chat.lastMessage.content.slice(0, 15)}...`
                                            : chat.lastMessage.content || '(empty)'}
                                    </p>
                                </div>
                                <div className='chatrow-right'>
                                    <p>{chat.lastMessage.createdAt ? formatTime(chat.lastMessage.createdAt) : null}</p>

                                    {deliveredMessagesCount[chat._id] > 0 && (
                                        <div className='msgcount-container'>
                                            <p>{deliveredMessagesCount[chat._id]}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))

            }
            {contextMenu.visible && (
                <div
                    ref={contextMenuRef}
                    className='context-menu'
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
                        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.08), 0px 0px 1px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <ul>
                        <li onClick={() => handleDeleteChat(selectedChat)}>Delete chat</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ChatList;
