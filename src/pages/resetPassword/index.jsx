import financeFlexLogo from '../../assets/finance-flex.svg'
import React from "react";
import '../../App.css'
import '../../index.css'

import { useState, useEffect } from 'react';
import { auth, provider } from '../../config/firebase-config';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { db } from "../../config/firebase-config.js";


function ResetPassword() {
  const [emailReset, setEmailReset] = useState('');
  const [fetching, setFetching] = useState(false);
  const [minimumRequirements, setMinimumRequirements] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();


  const resetPassword = async (email) => {
    setFetching(true);
    if (!email) {
      console.error('Email inválido');
      setFetching(false);
      return;
    }
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);   
      console.log('Email de redefinição de senha enviado');
      setErrorMessage('');
      setSuccessMessage('Email de redefinição de senha enviado');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        setErrorMessage('Email não encontrado');
      }
      console.error('Erro ao enviar o email de redefinição de senha:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    emailReset.length > 0 ? setMinimumRequirements(true) : setMinimumRequirements(false);

  }, [emailReset])

  return (
    <div className='loginPage'>
      <h1>
        <img src={financeFlexLogo} loading="lazy" width="250" alt="Finance Flex logo"/>
      </h1>

      <h3>Recuperação de senha</h3>
      <form className="formLogin">
        <input
            type="email"
            placeholder="Email"
            value={emailReset}
            onChange={(e) => setEmailReset(e.target.value)}
        />
        {successMessage && <p className="success">{successMessage}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="button" disabled={!minimumRequirements} onClick={() => resetPassword(emailReset)}>{fetching ? <span className="loader2"></span> : 'Recuperar senha'}</button>
        <a onClick={() => navigate('/login')}>Voltar</a>
      </form>

    </div>
  );
}

export default ResetPassword;