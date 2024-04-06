import React from 'react';
import { useState } from 'react';

const ChatList = ({ chatList, openChatByChatId }) => {
    const [searchTerm, setSearchTerm] = useState('');

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
                            <b>{chat.otherUsername}</b>
                            <p>{chat.lastMessage.content}</p>
                            <p>{formatTime(chat.lastMessage.createdAt)}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

export default ChatList;
