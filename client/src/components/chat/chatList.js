import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatList = ({ chatList, openChatByChatId, userId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deliveredMessagesCount, setDeliveredMessagesCount] = useState({});

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

    // Sort the chat list based on the last message's timestamp
    const sortedChats = chatList.slice().sort((a, b) => {
        const lastMessageA = a.lastMessage;
        const lastMessageB = b.lastMessage;

        // Ensure that lastMessage exists for both chats
        if (!lastMessageA || !lastMessageB) return 0;

        // Compare timestamps to determine sorting order
        return new Date(lastMessageB.createdAt) - new Date(lastMessageA.createdAt);
    });

    // Format the time to display in the chat list
    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className='chat-ongoing-chats'>
            <input
                className='find-chat-input'
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={handleSearch}
            />
            {
                sortedChats
                    .filter(chat => chat.otherUsername.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((chat) => (
                        <div key={chat._id} onClick={() => openChatByChatId(chat._id, Object.values(chat.participants))}>
                            <div className='chatlist-chatrow'>
                                <div className='chatrow-left'>
                                    <b>{chat.otherUsername}</b>
                                    <p>{chat.lastMessage.content}</p>
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
        </div>
    );
};

export default ChatList;
