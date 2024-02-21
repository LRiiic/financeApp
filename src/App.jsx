import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase-config';
import * as firebaseAuth from 'firebase/auth'
import LoginForm from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import TransactionForm from './pages/transactionForm';
import Profile from './pages/profile';
import NotFound from './pages/notFound';

function App() {
  return (
    <BrowserRouter>
      <div className='mainContainer'>
        <Routes>
          <Route path="/login" exact element={<LoginForm />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="*" element={<NotFound />} />
          
          <Route path="/" exact element={<Home />}>
            <Route path="/new-transaction" element={<TransactionForm />}/>
            <Route path="/edit-transaction/:id" element={<TransactionForm  />}/>
            <Route path="/profile" element={<Profile />}/>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;