import React from 'react'


const ContactsModal = ({ addModalRef, isAddModalVisible, setAddModalVisible}) => {
    return (
        <div ref={addModalRef} className={`contacts-modal ${isAddModalVisible ? 'visible' : ''}`}>
            <h1>hej</h1>
            <button onClick={() => setAddModalVisible(false)}>Close</button>
        </div>
    )
}

export default ContactsModal