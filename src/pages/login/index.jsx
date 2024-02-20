import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'
import './style.css'

import { useState } from 'react';
import { auth, provider, db } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { useNavigate, Navigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;
  
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const userDetails = await getDocs(q);
      const fetchedData = userDetails.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const authInfo = {
        userID: user.uid,
        email: user.email,
        displayName: fetchedData[0].displayName,
        isAuth: true,
      };

      localStorage.setItem('auth', JSON.stringify(authInfo));
      navigate('/');
      console.log('Usuário logado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
    }
  };

  return !isAuthenticated ? (
    <>
      <div>
        <h1>
          <img src={financeFlexLogo} loading="lazy" width="250" alt="Finance Flex logo"/>
        </h1>

        <form className="formLogin" onSubmit={handleLogin}>
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

          <button type="submit">Login</button>
          <button type="button" className='secondaryBtn margin-reset' onClick={() => navigate('/register')}>Cadastre-se</button>
        </form>
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Login;

