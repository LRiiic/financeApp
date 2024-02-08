import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useEffect, useState } from 'react'
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, getAggregateFromServer, sum } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";



function Home() {
  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);
  const [hora, setHora] = useState(new Date());
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomeValue, setIncomeValue] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [incomes, setIncomes] = useState([]);
  const [totalIncomes, setTotalIncomes] = useState(0);

  async function handleGetExpenses() {
    try {
      // Obter os documentos da coleção
      const q = query(collection(db, "expenses"), where("uid", "==", userInfo.userID));
      const expenses = await getDocs(q);
      // Mapear os documentos para os dados
      const fetchedData = expenses.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Atualizar o estado com os dados
      setExpenses(fetchedData);
      console.log(fetchedData);
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }
  async function handleGetTotalExpenses() {
    try {
      // Obter os documentos da coleção
      const q = query(collection(db, "expenses"), where("uid", "==", userInfo.userID));
      const expenses = await getDocs(q);
      // Calcular o total das despesas
      const totalAmount = expenses.docs.reduce((acc, doc) => {
        // Adicionar o valor da despesa ao acumulador
        return acc + parseFloat(doc.data().value);
      }, 0);
      // Atualizar o estado com o total das despesas
      setTotalExpenses(totalAmount);
      console.log(totalAmount)
  
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }   

  async function handleGetIncomes() {
    try {
      // Obter os documentos da coleção
      const q = query(collection(db, "incomes"), where("uid", "==", userInfo.userID));
      const incomes = await getDocs(q);
      // Mapear os documentos para os dados
      const fetchedData = incomes.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Atualizar o estado com os dados
      setIncomes(fetchedData);
      console.log(fetchedData);
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }

  async function handleGetTotalIncomes() {
    try {
      // Obter os documentos da coleção
      const q = query(collection(db, "incomes"), where("uid", "==", userInfo.userID));
      const incomes = await getDocs(q);
      // Calcular o total das despesas
      const totalAmount = incomes.docs.reduce((acc, doc) => {
        // Adicionar o valor da despesa ao acumulador
        return acc + parseFloat(doc.data().value);
      }, 0);
      // Atualizar o estado com o total das despesas
      setTotalIncomes(totalAmount);
      console.log(totalAmount)
  
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHora(new Date());
    }, 1000);


    handleGetExpenses();
    handleGetTotalExpenses();
    handleGetIncomes();
    handleGetTotalIncomes();

    return () => clearInterval(intervalId);
  },[])

  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    signOut(auth).then(() => {
      navigate('/');
      localStorage.removeItem('auth');
      setIsAuthenticated(false);
      console.log('Deslogado com sucesso!');
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  const handleNewExpense = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "expenses"), {
        name: expenseDescription,
        value: expenseValue,
        dateTime: hora,
        uid: userInfo.userID,
      });
      console.log("Despesa adicionada: ", docRef.id);
      handleGetExpenses();
      handleGetTotalExpenses();
      handleGetIncomes();
      handleGetTotalIncomes();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const handleNewIncome = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "incomes"), {
        name: incomeDescription,
        value: incomeValue,
        dateTime: hora,
        uid: userInfo.userID,
      });
      console.log("Receita adicionada: ", docRef.id);
      handleGetExpenses();
      handleGetTotalExpenses();
      handleGetIncomes();
      handleGetTotalIncomes();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const handleFormTransaction = (e) => {
    e.preventDefault();
    navigate('/new-transaction');
  }

  const handleNewTransaction = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        name: description,
        value: value,
        type: type,
        dateTime: hora,
        uid: userInfo.userID,
      });
      console.log("Transação registrada: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }


  return isAuthenticated ? (
    <>
      <div>
        <h1>
          <img src={financeFlexLogo} alt="Finance Flex logo" width="250"/>
        </h1>

        <h3>Bem vindo, {userInfo.email}</h3>
        <h5>{new Date().toLocaleDateString()} - {hora.toLocaleTimeString()}</h5>
        <div>
          <button type="button" onClick={handleSignOut}>Sair</button>
        </div>
        
        <form className="formIncome" onSubmit={handleNewIncome}>
          <input
            type="text"
            placeholder="Descrição da receita"
            value={incomeDescription}
            onChange={(e) => setIncomeDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor"
            value={incomeValue}
            onChange={(e) => setIncomeValue(e.target.value)}
          />
          <button type="submit">Nova receita</button>
        </form>

        <form className="formExpense" onSubmit={handleNewExpense}>
          <input
            type="text"
            placeholder="Descrição da despesa"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor"
            value={expenseValue}
            onChange={(e) => setExpenseValue(e.target.value)}
          />
          <button type="submit">Nova despesa</button>
        </form>

        <button type="button" onClick={handleFormTransaction}>+</button>

        <div>
          <h4>Saldo:</h4>
          <span>R$ 1000,00</span>
        </div>

        <div>
          <h4>Resumo:</h4>

          <div>
            <div>
              <h5>Receitas:</h5>
              <span>R$ {totalIncomes}</span>

              <ul>
                {incomes.map(item => (
                  <li key={item.id}>
                    <p>{item.name}</p>
                    <p>R$ {item.value}</p>
                    
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Despesas:</h5>
              <span>R$ {totalExpenses}</span>

              <ul>
                {expenses.map(item => (
                  <li key={item.id}>
                    <p>{item.name}</p>
                    <p>R$ {item.value}</p>
                    
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Navigate to="/" replace />
  );
}

export default Home;

