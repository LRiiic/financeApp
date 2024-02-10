import React, { useState, useEffect } from 'react';

function Popup({ message, type, onClose }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className={`popup ${type}`}>
          <p>{message}</p>
          <button onClick={handleClose}>Fechar</button>
        </div>
      )}
    </>
  );
}

export default Popup;