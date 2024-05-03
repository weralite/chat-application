// ChatArea.js
import React from 'react';
import { useState, useEffect, useRef } from 'react';

const ChatField = ({ activeChat, receiver, receiverOnline, userId, message, setMessage, sendMessage, chatEndRef }) => {
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [selectedMessage, setSelectedMessage] = useState(null);

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

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleContextMenu = (event, message) => {
        event.preventDefault();
        setSelectedMessage(message);
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
    };

    const handleClick = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleDeleteMessage = (message) => {
        console.log(message);
        setContextMenu({ visible: false, x: 0, y: 0 });
    }


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
                    activeChat.messages.map((message) => (
                        <div className='chat-message-container' onContextMenu={(e) => handleContextMenu(e, message)} onClick={handleClick} key={message._id}>
                            <b>{message.sender.toString() === userId.toString() ? 'You' : receiver}</b>
                            <p>{message.content}</p>
                            <p className='chat-message-status'>{message.status} {formatTime(message.updatedAt)}</p>
                        </div>
                    ))
                )}
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
                            <li onClick={() => handleDeleteMessage(selectedMessage)}>Delete message</li>
                        </ul>
                    </div>
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
