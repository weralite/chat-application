// ChatArea.js
import React from 'react';

const ChatField = ({ activeChat, receiver, receiverOnline, userId, message, setMessage, sendMessage, chatEndRef }) => {

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <>
            <div className='chat-room-header'>
                <b>{receiver}</b>
                {receiverOnline ? (
                    <p className='online-status'>online</p>
                ) : (
                    <p className='online-status'>offline</p>
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
                <form
                    className='chat-input-form'
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(message);
                        setMessage('');
                    }}
                >
                    <input
                        className='chat-input-box'
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                    <button
                        className='chat-send-button'
                        type="submit"
                    >
                        Send
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatField;
