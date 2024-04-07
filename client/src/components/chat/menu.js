import React from 'react';
import './menu.css'; // Import CSS file for styling

function SidebarMenu({ isOpen, username, closeMenu, setModalVisible, fetchContacts }) {
  return (
    <>
      {isOpen && (
        <div className="menu">
          <button onClick={closeMenu}>Close Menu</button>
          <h2>Logged in as: {username}</h2>
          <ul className="menu-items">
            <li
              onClick={() => {
                setModalVisible(true);
                fetchContacts(); // Fetch contacts when the modal is opened
              }}
            >
              Contacts
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default SidebarMenu;
