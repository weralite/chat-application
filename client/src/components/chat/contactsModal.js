import React from 'react'
import { useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { set } from 'mongoose';


const ContactsModal = ({ addModalRef, isAddModalVisible, setAddModalVisible, staticUserId }) => {
    const [userName, setUserName] = React.useState('');
    const [userId, setUserId] = React.useState('');
    const [users, setUsers] = React.useState([]);

console.log('Is modal visible', isAddModalVisible)

    useEffect(() => {
        if (userName) {
            getUsers();
        }
    }, [userName]);

    async function getUsers() {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/users/users?name=${userName}`);
            console.log(response.data);
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleAddContact = async () => {
        try {
            const body = {
                user1Id: staticUserId, 
                user2Id: userId 
            };
    
            const response = await axios.post('http://localhost:8080/api/v1/contacts/createContact', body);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // handle onsave
    const handleSave = () => {
        handleAddContact();
        setUserName('');
        setUserId('');
        setAddModalVisible(false);
    };


    return (
        <div ref={addModalRef} className={`contacts-modal ${isAddModalVisible ? 'visible' : ''}`}>
            <div>
                <h2>Add Contact</h2>

           
                <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.username}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    onInputChange={(event, newInputValue) => {
                        setUserName(newInputValue);
                    }}
                    onChange={(event, newValue) => {
                        setUserName(newValue ? newValue.username : '');
                        setUserId(newValue ? newValue._id : '');
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Username"
                            type="text"
                            inputProps={{
                                ...params.inputProps,
                                style: { width: "13rem", height: '1rem' }, 
                            }}
                        />
                    )}
                />
        
                <DialogActions>
                <button onClick={() => setAddModalVisible(false)}>Close</button>
                <button onClick={handleSave}>Save</button>
                </DialogActions>
            </div>
        </div>
    )
}

export default ContactsModal