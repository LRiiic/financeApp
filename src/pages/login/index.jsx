import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'
import './style.css'

import { useEffect, useState } from 'react';
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

  const [loading, setLoading] = useState(false);
  const [minimumRequirements, setMinimumRequirements] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    email.length > 0 && password.length >= 6 ? setMinimumRequirements(true) : setMinimumRequirements(false);

  }, [email, password])
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email' || error.code === 'auth/missing-password') {
        setErrorMessage('Credenciais inválidas!');
        console.error(error.message);
      } else {
        console.error('Erro ao fazer login:', error.message);
      }
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

        <h3>Login</h3>

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
          
          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" disabled={!minimumRequirements}>{loading ? <span className="loader2"></span> : 'Entrar'}</button>
          <button type="button" className='secondaryBtn margin-reset' onClick={() => navigate('/register')}>Criar uma conta</button>
        </form>
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Login;

