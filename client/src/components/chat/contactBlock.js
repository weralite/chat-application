import axios from 'axios';

// Function to block a contact
export const blockContact = async (user1Id, user2Id) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/v1/contacts/blockContact`, { user1Id, user2Id });
    return response.data.message;
  } catch (error) {
    console.error('Error blocking contact:', error);
    throw new Error('Failed to block contact');
  }
};

// Function to unblock a contact
export const unblockContact = async (user1Id, user2Id) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/v1/contacts/unblockContact`, { user1Id, user2Id });
    return response.data.message;
  } catch (error) {
    console.error('Error unblocking contact:', error);
    throw new Error('Failed to unblock contact');
  }
};
