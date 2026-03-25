import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

function CustomSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selected?.label || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(selected?.label || "");
  }, [selected]);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option) => {
    setInputValue(option.label);
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div className="custom-select" ref={dropdownRef}>
      <div className="input-box" onClick={() => setOpen(true)}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
        />
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="option"
                onClick={() => handleSelect(option)}
              >
                {option.image && (
                  <img src={option.image} alt="logo" className="option-img" />
                )}
                {option.label}
              </div>
            ))
          ) : (
            <div className="option">No match found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
