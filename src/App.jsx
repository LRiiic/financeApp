import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './config/firebase-config';
import { getAuth } from "firebase/auth";
import LoginForm from './pages/login';
import Register from './pages/register';
import ResetPassword from './pages/resetPassword';
import Transactions from './pages/transactions';
import Home from './pages/home';
import TransactionForm from './pages/transactionForm';
import Profile from './pages/profile';
import NotFound from './pages/notFound';

function App() {
  const auth = getAuth();
  const user = auth.currentUser;

  function getUser() {
    return user && user.emailVerified;
  }

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginForm />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/transactions",
      element: <Transactions />,
      loader: () => getUser(),
    },
    {
      path: "/",
      element: <Home />,
      loader: () => getUser(),

      children: [
        {
          path: "/new-transaction",
          element: <TransactionForm />
        },
        {
          path: "/edit-transaction/:id",
          element: <TransactionForm />
        },
        {
          path: "/profile",
          element: <Profile />
        }
      ],
    },
    { path: "*", element: <NotFound /> }
  ]);

  return <div className='mainContainer'><RouterProvider router={router} /></div>
}

export default App;