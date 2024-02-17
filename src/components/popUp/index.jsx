import React, { useState, useEffect } from 'react';

function Popup({ message, type, onClose }) {


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`popup ${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}

export default Popup;