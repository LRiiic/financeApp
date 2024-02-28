import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'
import './style.css'

import { useEffect, useState } from 'react';
import { auth, provider, db } from '../../config/firebase-config';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { useNavigate, Navigate } from 'react-router-dom';
import Footer from '../../components/footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [minimumRequirements, setMinimumRequirements] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaFullScreen, setPwaFullScreen] = useState(null);

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

      let displayName = user.email;
      if (fetchedData.length > 0) {
        displayName = fetchedData[0].displayName;
      }
      
      const authInfo = {
        userID: user.uid,
        email: user.email,
        displayName: displayName,
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

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaFullScreen(true);
    } else {
      setPwaFullScreen(false);
    }

    const userAgent = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    const handleBeforeInstallPrompt = (event) => {
      // Salvar o evento para poder chamar prompt() posteriormente
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      showIOSInstructions();
    } else {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('O usuário aceitou instalar o PWA');
        } else {
          console.log('O usuário cancelou a instalação do PWA');
        }

        setDeferredPrompt(null);
      });
    }
  };


  const showIOSInstructions = () => {
    const instructions = 'No iOS, toque no ícone de compartilhamento e selecione "Adicionar à Tela de Início" para instalar este aplicativo.';
    alert(instructions);
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
        <a className="forgotPassword" onClick={() => navigate('/reset-password')}>Esqueceu a senha?</a>
        <button id="install-button" style={{ display: pwaFullScreen ? 'none' : isIOS ? 'flex' : (deferredPrompt ? 'flex' : 'none') }} onClick={handleInstallClick}>
          <i></i>Adicionar à tela inicial
        </button>
        <Footer />
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Login;

