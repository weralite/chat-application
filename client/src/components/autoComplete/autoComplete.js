import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './autoComplete.css';

function CustomAutocomplete({ options, onInputChange, onChange, clearInput, setClearInput }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter((option) =>
        option.username.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  }, [inputValue, options]);

  useEffect(() => {
    if (clearInput) {
      setInputValue('');
      setClearInput(false);
    }
  }, [clearInput, setClearInput]);
  

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    onInputChange(event, event.target.value);
  };
  

  const handleOptionClick = (option) => {
    setInputValue(option.username);
    setFilteredOptions([]);
    onChange(null, option);
  };
  

  return (
    <div className='positions-box'>
    <div className='option-box'>
      <input className='option-input' type="text" placeholder="Username" value={inputValue} onChange={handleInputChange} />
      {filteredOptions.map((option, index) => (
        <div className='option-item' key={index} onClick={() => handleOptionClick(option)}>
          {option.username}
        </div>
      ))}
    </div>
    </div>
  );
}

export default CustomAutocomplete;