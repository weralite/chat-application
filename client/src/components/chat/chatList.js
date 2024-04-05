import React from 'react'

const chatList = ({ chats, openChatByChatId }) => {
    return (
        <div className='chat-ongoing-chats'>
            <p>chats</p>
            <input className='find-chat-input' type='text' placeholder='Find chat' />
            {
                chats
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
    )
}

export default chatList