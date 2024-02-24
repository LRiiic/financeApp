import { React } from "react";
import '../../index.css';
import './style.css';
import { useNavigate, NavLink } from 'react-router-dom';


function ActionBar() {
  return (
    <div className="action-bar">
      <div className="wrapper">
        <NavLink to="/" className={({ isActive }) => isActive ? 'action-icon home active' : 'action-icon home'}>
            <i></i>
        </NavLink>
        <NavLink to="/new-transaction" className={({ isActive }) => isActive ? 'action-icon new-transaction active' : 'action-icon new-transaction'}>
          <div className="main-action">
            <i></i>
          </div>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'action-icon profile active' : 'action-icon profile'}>
          <i></i>
        </NavLink>
      </div>
    </div>
  );
}

export default ActionBar;