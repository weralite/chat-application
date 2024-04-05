import React from 'react';

const ChatList = ({ chatList, openChatByChatId }) => {
    // Sort the chat list based on the last message's timestamp
    const sortedChats = chatList.slice().sort((a, b) => {
        const lastMessageA = a.lastMessage;
        const lastMessageB = b.lastMessage;

        // Ensure that lastMessage exists for both chats
        if (!lastMessageA || !lastMessageB) return 0;

        // Compare timestamps to determine sorting order
        return new Date(lastMessageB.createdAt) - new Date(lastMessageA.createdAt);
    });

    return (
        <div className='chat-ongoing-chats'>
            <p>Chats</p>
            <input className='find-chat-input' type='text' placeholder='Find chat' />
            {
                sortedChats.map((chat) => (
                    <div key={chat._id} onClick={() => openChatByChatId(chat._id, Object.values(chat.participants))}>
                        <div>
                            <b>{chat.otherUsername}</b>
                            <p>{chat.lastMessage.content}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

export default ChatList;
