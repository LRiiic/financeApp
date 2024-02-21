import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'
import './style.css'

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { auth, provider } from '../../config/firebase-config.js';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, query, where, getAggregateFromServer, sum, getFirestore, Timestamp, serverTimestamp } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

import Popup from '../../components/popUp/index.jsx';


function transactionForm({description = '', value = 0, date = '', type = ''}) {
    const userInfo = JSON.parse(localStorage.getItem('auth'));
    const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);
    const navigate = useNavigate();
    const [hora, setHora] = useState(new Date());

    const [transactionDescription, setTransactionDescription] = useState(description);
    const [transactionValue, setTransactionValue] = useState(value);
    const [transactionDate, setTransactionDate] = useState(date);
    const [transactionType, setTransactionType] = useState(type);
    const [time, setTime] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [messagePopup, setMessagePopup] = useState(null);
    const [typePopup, setTypePopup] = useState(null);
    const [invalid, setInvalid] = useState([]);
    const { id } = useParams();

    const handleshowPopup = (message, type) => {
        setMessagePopup(message)
        setTypePopup(type)
        setShowPopup(true);
    };

    async function handleGetTransactionById(idTransaction) {
        try {
            const transactionRef = doc(db, 'transactions', idTransaction);
            const docSnap = await getDoc(transactionRef);

            if (docSnap.exists() && docSnap.data().uid === userInfo.userID) {
                const transactionData = docSnap.data();
                const transactionDate = transactionData.dateTime.split('T')[0];
                setTransactionDescription(transactionData.name);
                setTransactionValue(transactionData.value);
                setTransactionType(transactionData.type);
                setTransactionDate(transactionDate);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do Firestore:', error);
            handleshowPopup('Erro ao buscar dados do Firestore', 'error');
        }
    }

    const handleUpdateTransaction = async (e) => {
        e.preventDefault();
        try {
            const transactionRef = doc(db, 'transactions', id);
            await updateDoc(transactionRef, {
                name: transactionDescription,
                value: transactionValue,
                type: transactionType,
                dateTime: transactionDate,
            });
            handleshowPopup('Transação editada com sucesso!', 'success');
        } catch (error) {
            handleshowPopup('Erro ao editar transação!', 'error');
        }
    }

    useEffect(() => {
        if (location.pathname.includes('edit-transaction')) {
            handleGetTransactionById(id);
        }
        
        const intervalId = setInterval(() => {
          setHora(new Date());
        }, 1000);
        
        return () => clearInterval(intervalId);
    },[])

const handleNewTransaction = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setInvalid([]);

    const isInvalid = (value) => {
        if (!value || value === 0 || value === '') {
            setInvalid((invalid) => [...invalid, value]);
            return true;
        }
        return false;
    };

    if (isInvalid(transactionDescription) || isInvalid(transactionValue) || isInvalid(transactionType) || isInvalid(transactionDate)) {
        return;
    }

    try {
        if (location.pathname.includes('edit-transaction')) {
            handleUpdateTransaction(e);
            return;
        }

        const date = new Date(transactionDate);
        const timestamp = date.getTime();
        const tomorrowDate = new Date(timestamp);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const dia = String(tomorrowDate.getDate()).padStart(2, '0');
        const mes = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
        const data = `${tomorrowDate.getFullYear()}-${mes}-${dia}`;
        const tomorrowHours = new Date();
        const dataCompleta = `${data}T${String(tomorrowHours.getHours()).padStart(2, '0')}:${String(tomorrowHours.getMinutes()).padStart(2, '0')}:00`;

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
            <div className='transactionPage'>
            {showPopup && (
                <Popup
                message={messagePopup}
                type={typePopup}
                onClose={() => setShowPopup(false)}
                />
            )}

                <h1 className='title'>
                    {id ? 'Editar transação' : 'Nova transação'}
                </h1>
                <form className='formNewTransaction' onSubmit={handleNewTransaction}>
                    <div className='formNewTransaction__inputs'>
                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="description">Descrição</label>
                            <input
                                type="text"
                                id="description"
                                className={invalid.includes('description') ? 'invalid' : ''}
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
                                className={invalid.includes('value') ? 'invalid' : ''}
                                placeholder="Valor da transação"
                                value={transactionValue}
                                onChange={(e) => setTransactionValue(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <label htmlFor="date">Data</label>
                            <input
                                type="date"
                                id="date"
                                className={invalid.includes('date') ? 'invalid' : ''}
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                            />
                        </div>

                        <div className='formNewTransaction__inputs__input'>
                            <span htmlFor="type" className={invalid.includes('type') ? 'invalid' : ''}>Tipo</span>
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
                        <button type="button" className='secondaryBtn' onClick={() => navigate('/')}>Voltar</button>
                        <button type="submit">{id ? 'Editar' : 'Registrar'} transação</button>
                    </div>
                </form>
            </div>
        </>
    ) : (
        <Navigate to="/login" />
    )
}

export default transactionForm;