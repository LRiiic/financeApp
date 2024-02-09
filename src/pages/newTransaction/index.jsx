import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { auth, provider } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, getAggregateFromServer, sum, getFirestore, Timestamp, serverTimestamp } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

function newTransaction() {
    const userInfo = JSON.parse(localStorage.getItem('auth'));
    const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);
    const navigate = useNavigate();
    const [hora, setHora] = useState(new Date());

    const [transactionDescription, setTransactionDescription] = useState('');
    const [transactionValue, setTransactionValue] = useState(0);
    const [transactionType, setTransactionType] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [time, setTime] = useState('');

    const handleGetTimestamp = async (e) => {
        const myTimestamp = Timestamp.fromDate(new Date());
        console.log('myTimestamp', myTimestamp);
        setTime(myTimestamp);
    }

    

    useEffect(() => {
        const intervalId = setInterval(() => {
          setHora(new Date());
        }, 1000);
        
        return () => clearInterval(intervalId);
    },[])

    const handleNewTransaction = async (e) => {
        e.preventDefault();
        try {

        const inputDate = new Date(transactionDate);

        // Verificar se o valor do input date é válido
        if (isNaN(inputDate.getTime())) {
            alert("Data inválida");
            throw new Error('Data inválida');
        }

        // Formatar a data para o formato desejado
        const formattedDate = format(inputDate, "d 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'x", { locale: ptBR });

        console.log('DATA: ', formattedDate);
        const docRef = await addDoc(collection(db, "transactions"), {
            name: transactionDescription,
            value: transactionValue,
            type: transactionType,
            dateTime: formattedDate,
            uid: userInfo.userID,
        });
        console.log("Transação registrada: ", docRef.id);
        } catch (e) {
        console.error("Error adding document: ", e);
        }
    }

    function handleTypeChange(event) {
        setTransactionType(event.target.value);
    }

    return isAuthenticated ? (
        <>
            <div>
                <h1>newTransaction</h1>
                <form className='formNewTransaction' onSubmit={handleNewTransaction}>
                    <div className='formNewTransaction__inputs'>
                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="description">Descrição</label>
                            <input
                                type="text"
                                id="description"
                                placeholder="Descrição da transação"
                                value={transactionDescription}
                                onChange={(e) => setTransactionDescription(e.target.value)}
                            />
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="value">Valor</label>
                            <input
                                type="number"
                                id="value"
                                placeholder="Valor da transação"
                                value={transactionValue}
                                onChange={(e) => setTransactionValue(e.target.value)}
                            />
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="type">Tipo</label>
                            <input 
                                type="radio"
                                id="income"
                                name="type"
                                value="income"
                                checked={transactionType === 'income'}
                                onChange={handleTypeChange}
                            />
                            <label htmlFor="income">Entrada</label>
                            <input 
                                type="radio"
                                id="expense"
                                name="type"
                                value="expense"
                                checked={transactionType === 'expense'}
                                onChange={handleTypeChange}
                            />
                            <label htmlFor="expense">Saída</label>
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="date">Data</label>
                            <input
                                type="date"
                                id="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                            />
                        </div>

                        <br/>
                        <button type="button" onClick={() => navigate('/home')}>Voltar</button>
                        <button type="submit">Registrar transação</button>
                    </div>
                </form>
            </div>
        </>
    ) : (
        <Navigate to="/login" />
    )
}

export default newTransaction;