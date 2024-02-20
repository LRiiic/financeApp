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
        <li>
          <button className="action-icon home" type="button" onClick={() => navigate('/')}>
            <i></i>
            <span>Início</span>
          </button>
        </li>
        <li>
          <button className="action-icon new-transaction main-action" type="button" onClick={() => navigate('/new-transaction')}>
            <i></i>
          </button>
        </li>
        <li>
          <button className="action-icon profile" type="button" onClick={() => navigate('/profile')}>
            <i></i>
            <span>Perfil</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ActionBar;