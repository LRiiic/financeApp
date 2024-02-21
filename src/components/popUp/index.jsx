import React, { useState, useEffect } from 'react';

function Popup({ message, type, onClose, deleteTransaction, id, loading }) {

  useEffect(() => {
    if (type === 'alert') return;
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`popup ${type}`}>
      <p>{message}</p>
      <button className={type !== 'alert' ? 'primaryBtn' : 'secondaryBtn'} onClick={onClose}>Fechar</button>
      {type === 'alert' && (
        <button className='primaryBtn' onClick={() => deleteTransaction(id)}>
          {loading ? <span className="loader2"></span> : 'Confirmar'}
        </button>
      )}
    </div>
  );
}

export default Popup;