import React from "react";
import '../../App.css'
import '../../index.css'

import { useNavigate, Navigate } from 'react-router-dom';


export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div>
            <h3>Página não encontrada</h3>
            <button type="button" onClick={() => navigate('/home')}>Página inicial</button>
        </div>
    );
}