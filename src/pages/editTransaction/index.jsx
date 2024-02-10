import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { auth, provider } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, query, where, getAggregateFromServer, sum } from "firebase/firestore"; 
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
    const [transaction, setTransaction] = useState('');
    const [transactionError, setTransactionError] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [messagePopup, setMessagePopup] = useState(null);
    const [typePopup, setTypePopup] = useState(null);

    const handleshowPopup = (message, type) => {
        setMessagePopup(message)
        setTypePopup(type)
        setShowPopup(true);
    };

    let { id } = useParams();

    useEffect(() => {
        const intervalId = setInterval(() => {
          setHora(new Date());
        }, 1000);
    
        handleGetTransactionById(id);
        return () => clearInterval(intervalId);
    },[])

    async function handleGetTransactionById(idTransaction) {
        try {
            const transactionRef = doc(db, 'transactions', idTransaction);
            const docSnap = await getDoc(transactionRef);

            if (docSnap.exists() && docSnap.data().uid === userInfo.userID) {
                const transactionData = docSnap.data();
                setTransaction(transactionData);
                setTransactionDescription(transactionData.name);
                setTransactionValue(transactionData.value);
                setTransactionType(transactionData.type);
                setTransactionDate(transactionData.dateTime);
            } else {
                setTransactionError(true);
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

    function handleTypeChange(event) {
        setTransactionType(event.target.value);
    }

    return isAuthenticated ? (
        !transactionError ? (         
            <>
                <div>
                    {showPopup && (
                        <Popup
                        message={messagePopup}
                        type={typePopup}
                        onClose={() => setShowPopup(false)}
                        />
                    )}
                    <h1 className='title'>Editar transação</h1>

                    <form className='formNewTransaction' onSubmit={handleUpdateTransaction}>
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
                            <button type="submit">Editar transação</button>
                        </div>
                    </form>
                </div>
            </>
        ) : (
            <>
                <h3>Transação não encontrada</h3>
                <button type="button" onClick={() => navigate('/home')}>Página inicial</button>
            </>
        )
    ) : (
        <Navigate to="/login" />
    )
}

export default newTransaction;