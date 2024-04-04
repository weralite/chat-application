// ChatArea.js
import React from 'react';

const ChatArea = ({ activeChat, receiver, receiverOnline, userId, message, setMessage, sendMessage, chatEndRef }) => {
    return (
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
    );
};

export default ChatArea;
