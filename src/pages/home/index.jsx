import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../App.css'
import '../../index.css'

import { useEffect, useState, useRef } from 'react'
import { Navigate, Outlet, Route, useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"; 
import { db } from "../../config/firebase-config.js";

import NavBar from '../../components/navBar';
import ActionBar from '../../components/actionBar';
import TransactionsList from '../../components/transactionsList';
import Popup from '../../components/popUp/index.jsx';

function Home() {
  const userInfo = JSON.parse(localStorage.getItem('auth'));

  const [isAuthenticated, setIsAuthenticated] = useState(userInfo ? userInfo.isAuth : false);

  const navigate = useNavigate();
  const location = useLocation();

  const [hora, setHora] = useState(new Date());

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByType, setSearchByType] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const [buttonIncomes, setButtonIncomes] = useState(false);
  const [buttonExpenses, setButtonExpenses] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [messagePopup, setMessagePopup] = useState(null);
  const [typePopup, setTypePopup] = useState(null);

  const [transactionId, setTransactionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);


  const iconIncomes = useRef(null);
  const iconExpenses = useRef(null);

  useEffect(() => {
    if (iconIncomes.current) {
      iconIncomes.current.style.height = iconIncomes.current.offsetWidth + 'px';
      iconExpenses.current.style.height = iconExpenses.current.offsetWidth + 'px';
    }
  }, [iconIncomes]);

  const handleshowPopup = (message, type, id) => {
    setMessagePopup(message)
    setTypePopup(type)
    setShowPopup(true);
    setTransactionId(id)
};

  const updateBalances = (filteredTransactions) => {
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
  }
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase(); // Converter o termo de busca para minúsculas
    setSearchTerm(term); // Atualizar o estado do termo de busca

    // Filtrar as transações que contenham o termo de busca no campo de descrição
    const filteredTransactions = transactions.filter(transaction =>
      transaction.name.toLowerCase().includes(term) ||
      transaction.value.toString().toLowerCase().includes(term)
    );

    updateBalances(filteredTransactions);
    setTotalResults(filteredTransactions.length);
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
    setTotalResults(filteredTransactions.length);
    setSearchResults(filteredTransactions);
  }
  async function handleGetTransactions() {
    setFetching(true);
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
      setTotalResults(fetchedData.length);
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
      setFetching(false);
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  }

  useEffect(() => {
    location.pathname === '/' && handleGetTransactions();
  }, [location]);

  const handleFormTransaction = (e) => {
    e.preventDefault();
    navigate('/new-transaction');
  }

  const formatDate = (dateInfo) => {
    var date = new Date(dateInfo);
    var timestamp = date.getTime();
    const tomorrowDate = new Date(timestamp);
    const tomorrowHours = new Date();
    
    tomorrowDate.setDate(tomorrowDate.getDate());
    const dia = String(tomorrowDate.getDate()).padStart(2, '0');
    const mes = String(tomorrowDate.getMonth()+1).padStart(2, '0');
    const data = tomorrowDate.getFullYear() + '-' + mes + '-' + dia;
    let completeDate = data + 'T' + String(tomorrowHours.getHours()).padStart(2, '0') + ':' + String(tomorrowHours.getMinutes()).padStart(2, '0')+':00';

    return completeDate;
  }

  function handleFilterDateChange(event) {
    if (filterDate === event.target.value) {
      setFilterDate(null);
      handleGetTransactions();
      return;
    } else {
      setFilterDate(event.target.value);
    }
    const dateValue = event.target.value;

    let selectedDate = '';
    if (dateValue === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      selectedDate = yesterday;
    } else if (dateValue === 'today' || dateValue === 'month' || dateValue === 'year') {
      selectedDate = new Date();
    } else if (dateValue === 'week') {
      
    }

    const filteredTransactions = transactions.filter(transaction => {
      let transactionDate = new Date(transaction.dateTime);
      transactionDate = formatDate(transactionDate);
      selectedDate = formatDate(selectedDate);
      transactionDate = new Date(transactionDate.split('T')[0].split('-').join('/'));
      selectedDate = new Date(selectedDate.split('T')[0].split('-').join('/'));

      if (dateValue === 'month') {
        return (transactionDate.getMonth()+1 === selectedDate.getMonth()+1);
      } else if (dateValue === 'year') {
        return (transactionDate.getFullYear() === selectedDate.getFullYear());
      } else if (dateValue === 'week') {
        return;
      } else if (dateValue === 'today' || dateValue === 'yesterday') {
        return (
        transactionDate.getDate() === selectedDate.getDate() &&
        transactionDate.getMonth()+1 === selectedDate.getMonth()+1 &&
        transactionDate.getFullYear() === selectedDate.getFullYear()
        );
      }
    });
    
    updateBalances(filteredTransactions);
    setFilterDate(event.target.value);
    setTotalResults(filteredTransactions.length);
    setSearchResults(filteredTransactions);
  }

  async function deleteTransaction(transactionId) {
    setLoading(true);
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
  
      await deleteDoc(transactionRef);
      
      handleGetTransactions();
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  }

  return isAuthenticated ? (
    <>
      <NavBar />
      <ActionBar />
      {location.pathname === '/' ?
        <>
            {showPopup && (
                <Popup
                  message={messagePopup}
                  type={typePopup}
                  onClose={() => setShowPopup(false)}
                  deleteTransaction={deleteTransaction}
                  id={transactionId}
                  loading={loading}
                />
            )}
            <h3 className='welcome'>Olá, <span className='userName'>{userInfo.displayName ? userInfo.displayName : userInfo.email}</span></h3>

            <div className='cards-informations'>
              <div className='card-info card-balance'>
                <i></i>
                <div className="content">
                  <h4 className={fetching ? 'loadingElement' : ''}>Saldo:</h4>
                  <span className={fetching ? 'useSecurity loadingElement' : 'useSecurity'}>R$ {parseFloat(totalBalance).toFixed(2)}</span>
                </div>
              </div>

              <button type='button' className={buttonIncomes ? 'card-info card-incomes filtered' :'card-info card-incomes' } onClick={(e) => handleFilterByType(e, 'income')}>
                <i ref={iconIncomes}></i>
                <div className="content">
                  <h4 className={fetching ? 'loadingElement' : ''}>Entradas:</h4>
                  <span className={fetching ? 'useSecurity loadingElement' : 'useSecurity'}>R$ {parseFloat(totalIncomes).toFixed(2)}</span>
                </div>
              </button>

              <button className={buttonExpenses ? 'card-info card-expenses filtered' :'card-info card-expenses' } onClick={(e) => handleFilterByType(e, 'expense')}>
                <i ref={iconExpenses}></i>
                <div className="content">
                  <h4 className={fetching ? 'loadingElement' : ''}>Saídas:</h4>
                  <span className={fetching ? 'useSecurity loadingElement' : 'useSecurity'}>R$ {parseFloat(totalExpenses).toFixed(2)}</span>
                </div>
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

                <div className='filtersDate'>
                  <div className="filtersWrap">
                    <div className="inputWrap">
                      <input type="radio" id="yesterday" name="type" value="yesterday"
                        checked={filterDate === 'yesterday'} onChange={handleFilterDateChange} onClick={handleFilterDateChange}
                      />
                      <label className="filterDate" htmlFor="yesterday">Ontem</label>
                    </div>

                    <div className="inputWrap">
                      <input type="radio" id="today" name="type" value="today"
                        checked={filterDate === 'today'} onChange={handleFilterDateChange} onClick={handleFilterDateChange}
                      />
                      <label className="filterDate" htmlFor="today">Hoje</label>
                    </div>
                    
                    <div className="inputWrap">
                      <input type="radio" id="week" name="type" value="week"
                        checked={filterDate === 'week'} onChange={handleFilterDateChange} onClick={handleFilterDateChange}
                      />
                      <label className="filterDate" htmlFor="week">Esta semana</label>
                    </div>

                    <div className="inputWrap">
                      <input type="radio" id="month" name="type" value="month"
                        checked={filterDate === 'month'} onChange={handleFilterDateChange} onClick={handleFilterDateChange}
                      />
                      <label className="filterDate" htmlFor="month">Este mês</label>
                    </div>
                    
                    <div className="inputWrap">
                      <input type="radio" id="year" name="type" value="year"
                        checked={filterDate === 'year'} onChange={handleFilterDateChange} onClick={handleFilterDateChange}
                      />
                      <label className="filterDate" htmlFor="year">Este ano</label>
                    </div>
                  </div>
                </div>

                <div className="transactions">
                  <h4 style={{marginBottom: '0px'}}>Transações:</h4>
                  <small className={fetching ? 'loadingElement' : ''}>{totalResults} transações encontradas</small>

                  { fetching ? <ul className='transactions-list'><li className='cardSkeleton'></li><li className='cardSkeleton'></li></ul>
                    : <TransactionsList 
                    transactions={transactions}
                    searchTerm={searchTerm}
                    searchResults={searchResults}
                    searchByType={searchByType}
                    filterDate={filterDate}
                    handleGetTransactions={handleGetTransactions}
                    handleshowPopup={handleshowPopup}/>
                  }
                </div>
              </div>
            </div>
        </> : (
          <Outlet />
        )}
      </>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default Home;

