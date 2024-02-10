import React from 'react';
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { deleteDoc, doc } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

function TransactionCard({ item, handleGetTransactions, nextItem }) {
  const navigate = useNavigate();

  async function deleteTransaction(transactionId) {
    try {
      // Referenciar o documento que você deseja excluir
      const transactionRef = doc(db, 'transactions', transactionId);
  
      // Excluir o documento
      await deleteDoc(transactionRef);
      handleGetTransactions();
      console.log('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
    }
  }

  const transactionDetails = (transactionId) => {
    return function(event) {
      // Acessa o elemento clicado usando event.target
      if(event.target.className === 'transaction-card') {
        if (event.target.querySelector('.transaction-remove').style.width === '30%') {
          event.target.querySelector('.transaction-remove').style.width = '0%';
          event.target.querySelector('.transaction-remove').style.opacity = '0';
          event.target.querySelector('.transaction-remove').style.visibility = 'hidden';
        } else {
          event.target.querySelector('.transaction-remove').style.width = '30%';
          event.target.querySelector('.transaction-remove').style.opacity = '1';
          event.target.querySelector('.transaction-remove').style.visibility = 'visible';
        }
      }
    };
  }

  const groupTransactionsByDate = (transactions) => {
    const groupedTransactions = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateString = date.toDateString();
      if (!groupedTransactions[dateString]) {
        groupedTransactions[dateString] = [];
      }
      groupedTransactions[dateString].push(transaction);
    });
    return groupedTransactions;
  };

  return (
    <>
    <li className={'transaction-card'} date={item.dateTime.substr(0, 10)} onClick={transactionDetails(item.id)}>
        <span className='transaction-remove'>
            <div className='edit-icon' onClick={() => navigate('/edit-transaction/' + item.id)}></div>
            <div className='remove-icon' onClick={() => deleteTransaction(item.id)}></div>
        </span>
        <span className={'transaction-badge transaction-' + item.type}></span>
        
            <p className='transaction-name'>
                {item.name}
                <br/>
                <small className="transaction-date">{new Date(item.dateTime.substr(0, 10)).toLocaleDateString()}</small>
            </p>   
            <p className='transaction-value'>R$ {parseFloat(item.value).toFixed(2)}</p>
    </li>
    </>
  );
}

export default TransactionCard;