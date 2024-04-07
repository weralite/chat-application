// ChatArea.js
import React from 'react';

const ChatArea = ({ activeChat, receiver, receiverOnline, userId, message, setMessage, sendMessage, chatEndRef }) => {

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

    return (
        <>
        <div className='chat-room-header'>
            {receiverOnline ? (
                <p>{receiver} is online</p>
            ) : (
                <p>{receiver} is offline</p>
            )}
            </div>
            <div className='chat-textbox'>
                {activeChat && activeChat.messages && (
                    activeChat.messages.map((message, index) => (
                        <div className='chat-message-container' key={index}>
                            <b>{message.sender.toString() === userId.toString() ? 'You' : receiver}</b>
                            <p>{message.content}</p>
                            <p className='chat-message-status'>{message.status} {formatTime(message.updatedAt)}</p>
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
    );
};

export default ChatArea;
