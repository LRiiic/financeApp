import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useState } from 'react';
import { auth, provider } from '../../config/firebase-config';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { db } from "../../config/firebase-config.js";


function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);

  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName
      });

      const authInfo = {
        userID: user.uid,
        email: user.email,
        displayName: displayName,
        isAuth: true,
      };

      localStorage.setItem('auth', JSON.stringify(authInfo));

      setEmail('');
      setPassword('');
      setDisplayName('');

      console.log('Usuário logado com sucesso!', user);
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
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
            placeholder="Digite seu nome"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Senha</label>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Criar conta</button>
          <a onClick={() => navigate('/login')}>Voltar</a>
        </form>
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Register;