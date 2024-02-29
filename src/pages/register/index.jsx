import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useState } from 'react';
import { auth, provider } from '../../config/firebase-config';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { db } from "../../config/firebase-config.js";
import MaskedInput from 'react-text-mask';
import { useEffect } from 'react';


function Register({displayName = '', email = '', cellphone = '', password = ''}) {
  const [userDisplayName, setUserDisplayName] = useState(displayName);
  const [userEmail, setUserEmail] = useState(email);
  const [userCellphone, setUserCellphone] = useState(cellphone);
  const [userPassword, setUserPassword] = useState(password);
  const [loading, setLoading] = useState(false);
  const [minimumRequirements, setMinimumRequirements] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);

  const navigate = useNavigate();
  const auth = getAuth();

  const [invalid, setInvalid] = useState([]);
  const phoneMask = ['(',/[1-9]/,/\d/,')',' ',/\d/,/\d/,/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,/\d/];

  useEffect(() => {
    email.length > 0 && password.length >= 6 ? setMinimumRequirements(true) : setMinimumRequirements(false);
    userDisplayName.length >= 3 && userEmail.length > 0 && userCellphone.length >= 15 && userPassword.length >= 6 ? setMinimumRequirements(true) : setMinimumRequirements(false);
  }, [userDisplayName, userEmail, userCellphone, userPassword]);

  const handleSignUp = async (e) => {
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
    
    if (userDisplayName === '') setInvalid((invalid) => [...invalid, 'displayName']);
    if (userEmail === '') setInvalid((invalid) => [...invalid, 'email']);
    if (userCellphone === '') setInvalid((invalid) => [...invalid, 'cellphone']);
    if (userPassword === '') setInvalid((invalid) => [...invalid, 'password']);
    if (userDisplayName === '' || userPassword === '' || userEmail === '' || userCellphone === '') return;
    if (isInvalid(userDisplayName) || isInvalid(userEmail) || isInvalid(userCellphone) || isInvalid(userPassword)) {
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;
      const cleanedCellphone = userCellphone.replace(/\D/g, "");
      const userAuth = auth.currentUser;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: userDisplayName,
        cellphone: cleanedCellphone,
        tutorial: true,
      });

      const authInfo = {
        userID: user.uid,
        email: user.email,
        displayName: userDisplayName,
        isAuth: true,
        tutorial: true,
      };

      localStorage.setItem('auth', JSON.stringify(authInfo));

      setUserEmail('');
      setUserPassword('');
      setUserDisplayName('');
      setUserCellphone('');

      if (userAuth) {
        try {
          await sendEmailVerification(userAuth);
          console.log('Email de verificação enviado');
        } catch (error) {
          console.error('Erro ao enviar o email de verificação:', error);
        }
      } else {
        console.log('Nenhum usuário autenticado');
      }

      console.log('Usuário logado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return !isAuthenticated ? (
    <>
      <div className='loginPage'>
        <h1>
          <img src={financeFlexLogo} loading="lazy" width="250" alt="Finance Flex logo"/>
        </h1>

        <h3>Criar uma conta</h3>

        <form className="formLogin" onSubmit={handleSignUp}>
          <label>Nome</label>
          <input
            type="text"
            id="displayName"
            className={invalid.includes('displayName') ? 'invalid' : ''}
            placeholder="Digite seu nome"
            value={userDisplayName}
            onChange={(e) => setUserDisplayName(e.target.value)}
          />
          <label>Email</label>
          <input
            type="email"
            id="email"
            className={invalid.includes('email') ? 'invalid' : ''}
            placeholder="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <label>Celular</label>
          <MaskedInput
            mask={phoneMask}
            placeholder="(12) 34567-8900"
            guide={false}
            value={userCellphone}
            onChange={(e) => setUserCellphone(e.target.value)}
            id="cellphone"
            className={invalid.includes('cellphone') ? 'invalid' : ''}
            type="tel"
          />
          <label>Senha</label>
          <input
            type="password"
            id="password"
            className={invalid.includes('password') ? 'invalid' : ''}
            placeholder="Senha"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />

          <button type="submit" disabled={!minimumRequirements}>{loading ? <span className="loader2"></span> : 'Criar conta'}</button>
          <a onClick={() => navigate('/login')}>Voltar</a>
        </form>
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Register;