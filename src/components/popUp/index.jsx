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
      <button onClick={onClose}>Fechar</button>
      {type === 'alert' && (
        <button onClick={() => deleteTransaction(id)}>
          {loading ? <span className="loader2"></span> : 'Confirmar'}
        </button>
      )}
    </div>
  );
}

export default Popup;