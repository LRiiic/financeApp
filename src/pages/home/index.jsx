import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useEffect, useState } from 'react'
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

import TransactionCard from '../../components/transactionCard'

function Home() {
  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);
  const navigate = useNavigate();

  const [hora, setHora] = useState(new Date());

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByType, setSearchByType] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [buttonIncomes, setButtonIncomes] = useState(false);
  const [buttonExpenses, setButtonExpenses] = useState(false);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase(); // Converter o termo de busca para minúsculas
    setSearchTerm(term); // Atualizar o estado do termo de busca

    // Filtrar as transações que contenham o termo de busca no campo de descrição
    const filteredTransactions = transactions.filter(transaction =>
      transaction.name.toLowerCase().includes(term) ||
      transaction.value.toString().toLowerCase().includes(term)
    );

    let totalIncome = 0;
    let totalExpense = 0;
    filteredTransactions.forEach(transaction => {
      const numericValue = parseFloat(transaction.value);
      if (!isNaN(numericValue)) {
        if (transaction.type === 'income') {
          totalIncome += numericValue;
        } else if (transaction.type === 'expense') {
          totalExpense += numericValue;
        }
      }
    });
    setTotalIncomes(totalIncome);
    setTotalExpenses(totalExpense);
    setSearchResults(filteredTransactions); // Atualizar o estado dos resultados da busca
  };

  const handleFilterByType = (e, type) => {

    if (searchByType) {
      setSearchByType(false);
      setSearchTerm('');
      setSearchResults(transactions);
      setButtonIncomes(false);
      setButtonExpenses(false);

      return;
    }

    if (type === 'income') {
      setButtonIncomes(true);
      setButtonExpenses(false);
    }

    if (type === 'expense') {
      setButtonIncomes(false);
      setButtonExpenses(true);
    }

    let filteredTransactions = '';
    if (searchTerm) {
      filteredTransactions = searchResults.filter(transaction =>
        transaction.type === type && transaction.name.toLowerCase().includes(searchTerm) ||
        transaction.type === type && transaction.value.toString().toLowerCase().includes(searchTerm)
      );
    } else {
      filteredTransactions = transactions.filter(transaction =>
        transaction.type === type
      );
    }

    setSearchByType(true);
    setSearchResults(filteredTransactions);
  }
  async function handleGetTransactions() {
    try {
      // Obter os documentos da coleção
      const q = query(
        collection(db, "transactions"),
        where("uid", "==", userInfo.userID),
        orderBy("dateTime", "desc")
      );
      const transactions = await getDocs(q);
      // Mapear os documentos para os dados
      const fetchedData = transactions.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Atualizar o estado com os dados
      setTransactions(fetchedData);

      const q2 = query(collection(db, "transactions"), where("uid", "==", userInfo.userID), where("type", "==", "expense"));
      const expenses = await getDocs(q2);

      const totalExpenses = expenses.docs.reduce((acc, doc) => {
        // Adicionar o valor da despesa ao acumulador
        return acc + parseFloat(doc.data().value);
      }, 0);
      // Atualizar o estado com o total das despesas
      setTotalExpenses(totalExpenses);

      const q3 = query(collection(db, "transactions"), where("uid", "==", userInfo.userID), where("type", "==", "income"));
      const incomes = await getDocs(q3);

      const totalIncomes = incomes.docs.reduce((acc, doc) => {
        // Adicionar o valor da despesa ao acumulador
        return acc + parseFloat(doc.data().value);
      }, 0);

      setTotalIncomes(totalIncomes);

      const totalBalance = totalIncomes - totalExpenses;
      setTotalBalance(totalBalance);
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHora(new Date());
    }, 1000);

    handleGetTransactions();

    return () => clearInterval(intervalId);
  },[])

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

  const handleFormTransaction = (e) => {
    e.preventDefault();
    navigate('/new-transaction');
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
        
        <br/>
        <button type="button" onClick={handleFormTransaction}>+ Nova transação</button>

        <div className='cards-informations'>
          <div className='card-info card-balance'>
            <h4>Saldo:</h4>
            <span>R$ {parseFloat(totalBalance).toFixed(2)}</span>
          </div>

          <button type='button' className={buttonIncomes ? 'card-info card-incomes filtered' :'card-info card-incomes' } onClick={(e) => handleFilterByType(e, 'income')}>
            <h4>Entradas:</h4>
            <span>R$ {parseFloat(totalIncomes).toFixed(2)}</span>
          </button>

          <button className={buttonExpenses ? 'card-info card-expenses filtered' :'card-info card-expenses' } onClick={(e) => handleFilterByType(e, 'expense')}>
            <h4>Saídas:</h4>
            <span>R$ {parseFloat(totalExpenses).toFixed(2)}</span>
          </button>
        </div>

        <div>
          <div>
            <div className="toolbar">
              <input
                type="text"
                name="search"
                placeholder='Pesquisar...'
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div>
              <h4 style={{marginBottom: '0px'}}>Transações:</h4>
              <small>{transactions.length} transações encontradas</small>
              <ul className="transactions-list">
                {searchTerm === '' && !searchByType && transactions.map((item, index) => (
                  <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} nextItem={transactions[index]}/>
                ))}

                {searchByType && searchResults.map((item, index) => (
                  <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} nextItem={transactions[index]}/>
                ))}

                {searchTerm !== '' && !searchByType && searchResults.map((item, index) => (
                  <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} nextItem={transactions[index]}/>
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

