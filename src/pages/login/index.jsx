import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useState } from 'react';
import { auth, provider } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
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
      await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        const authInfo = {
          userID: user.uid,
          email: user.email,
          isAuth: true,
        };

        localStorage.setItem('auth', JSON.stringify(authInfo));
        navigate('/home');
        console.log('Usuário logado com sucesso!', user);
      })
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
          <a href="#">Cadastre-se</a>
        </form>
      </div>
    </>
  ) : (
    <Navigate to="/home" replace />
  );
}

export default Login;

