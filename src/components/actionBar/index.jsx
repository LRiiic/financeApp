import { React } from "react";
import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../index.css';
import './style.css';
import { useNavigate, Navigate } from 'react-router-dom';


function ActionBar() {
  const navigate = useNavigate();
  return (
    <div className="action-bar">
      <ul>
        <li><button type="button" onClick={() => navigate('/')}>Home</button></li>
        <li><button type="button" onClick={() => navigate('/new-transaction')}>Nova Transação</button></li>
        <li><button type="button" onClick={() => navigate('/profile')}>Perfil</button></li>
      </ul>
    </div>
  );
}

export default ActionBar;