import { React } from "react";
import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../index.css';
import './style.css';
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

function NavBar() {
  const [securityView, setSecurityView] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('textSecurity') === 'true') {
      setSecurityView(true);
    } else {
      setSecurityView(false);
    }
  }, [securityView])
  const handleSignOut = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    signOut(auth).then(() => {
      navigate('/login');
      localStorage.removeItem('auth');
      setIsAuthenticated(false);
    }).catch((error) => {
      throw error;
    });
  }
    
  const handleSecurityView = (e) => {
    let root = document.getElementById('root');
  
    if (localStorage.getItem('textSecurity') != 'true' && localStorage.getItem('textSecurity') != 'false') {
      localStorage.setItem('textSecurity', false);
      setSecurityView(false);
      return;
    }
  
    if (!e && localStorage.getItem('textSecurity') === 'true') {
      root.classList.add('textSecurity');
    }
  
    if (e && e.type === 'click') {
      if (securityView) {
        setSecurityView(false);
        localStorage.setItem('textSecurity', false);
        root.classList.remove('textSecurity');
      } else {
        setSecurityView(true);
        localStorage.setItem('textSecurity', true);
        root.classList.add('textSecurity');
      }
    }
  }
  
  handleSecurityView();

  return (
    <nav>
      <button className="logout" type="button" onClick={handleSignOut}><i></i><span>Sair</span></button>
      
      <h1>
        <a href="/">
          <img src={financeFlexLogo} alt="Finance Flex logo" width="50%"/>
        </a>
      </h1>

      <button className={securityView ? 'securityView active' : 'securityView'} type="button" onClick={handleSecurityView}><i></i></button>
    </nav>
  );
}

export default NavBar;