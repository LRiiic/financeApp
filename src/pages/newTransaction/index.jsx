import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'
import './style.css'

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { auth, provider } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, getAggregateFromServer, sum, getFirestore, Timestamp, serverTimestamp } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

import Popup from '../../components/popUp';


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
    const [showPopup, setShowPopup] = useState(false);
    const [messagePopup, setMessagePopup] = useState(null);
    const [typePopup, setTypePopup] = useState(null);

    const handleshowPopup = (message, type) => {
        setMessagePopup(message)
        setTypePopup(type)
        setShowPopup(true);
    };

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
        if (isNaN(inputDate.getTime())) {
            handleshowPopup('Data invalida!', 'error');
            return;
        }

        var date = new Date(transactionDate);
        var timestamp = date.getTime();
        const tomorrowDate = new Date(timestamp);
        const tomorrowHours = new Date();
        
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const dia = String(tomorrowDate.getDate()).padStart(2, '0');
        const mes = String(tomorrowDate.getMonth()+1).padStart(2, '0');
        const data = tomorrowDate.getFullYear() + '-' + mes + '-' + dia;
        let dataCompleta = data + 'T' + String(tomorrowHours.getHours()).padStart(2, '0') + ':' + String(tomorrowHours.getMinutes()).padStart(2, '0')+':00';
        const docRef = await addDoc(collection(db, "transactions"), {
            name: transactionDescription,
            value: transactionValue,
            type: transactionType,
            dateTime: dataCompleta,
            uid: userInfo.userID,
        });
        handleshowPopup('Transação registrada com sucesso!', 'success');
        } catch (e) {
        handleshowPopup('Erro ao registrar transação!', 'error');
        }
    }

    function handleTypeChange(event) {
        setTransactionType(event.target.value);
    }

    return isAuthenticated ? (
        <>
            <div>
            {showPopup && (
                <Popup
                message={messagePopup}
                type={typePopup}
                onClose={() => setShowPopup(false)}
                />
            )}

                <h1 className='title'>Nova transação</h1>
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
                            <label htmlFor="date">Data</label>
                            <input
                                type="date"
                                id="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                            />
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <span htmlFor="type">Tipo</span>
                            <div className="inputWrap inputWrapAlt">
                                <input 
                                    type="radio"
                                    id="income"
                                    name="type"
                                    value="income"
                                    checked={transactionType === 'income'}
                                    onChange={handleTypeChange}
                                />
                                <label htmlFor="income" className='typeTransaction'>Entrada</label>
                            </div>
                            <div className="inputWrap inputWrapAlt">
                                <input 
                                    type="radio"
                                    id="expense"
                                    name="type"
                                    value="expense"
                                    checked={transactionType === 'expense'}
                                    onChange={handleTypeChange}
                                />
                                <label htmlFor="expense" className='typeTransaction'>Saída</label>
                            </div>
                        </div>

                        <br/>
                        <button type="button" className='secondaryBtn' onClick={() => navigate('/home')}>Voltar</button>
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