import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase-config';
import * as firebaseAuth from 'firebase/auth'
import LoginForm from './pages/login';
import Home from './pages/home';
import NewTransaction from './pages/newTransaction';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<LoginForm />}/>
        <Route path="/home" element={<Home />}/>
        <Route path="/new-transaction" element={<NewTransaction />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;