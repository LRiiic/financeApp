import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useEffect, useState } from 'react'
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";



function Home() {
  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);
  const [hora, setHora] = useState(new Date());
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseValue, setExpenseValue] = useState('');

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHora(new Date());
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado
    async function handleGetExpenses() {
      try {
        // Obter os documentos da coleção
        const expenses = await getDocs(collection(db, "expenses"));
        // Mapear os documentos para os dados
        const fetchedData = expenses.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Atualizar o estado com os dados
        setExpenses(fetchedData);
      } catch (error) {
        console.error('Erro ao buscar dados do Firestore:', error);
      }
    }

    handleGetExpenses();


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
        
        <button type="button">Nova receita</button>

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

        <div>
          <h4>Saldo:</h4>
          <span>R$ 1000,00</span>
        </div>

        <div>
          <h4>Resumo:</h4>

          <div>
            <div>
              <h5>Receitas:</h5>
              <span>R$ 500,00</span>
            </div>
            <div>
              <h5>Despesas:</h5>

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

