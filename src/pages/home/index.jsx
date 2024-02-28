import financeFlexLogo from "../../assets/finance-flex.svg";
import "../../App.css";
import "../../index.css";
import "./style.css";

import { useEffect, useState, useRef } from "react";
import {
  Navigate,
  Outlet,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { getAuth, signOut, sendEmailVerification } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "../../config/firebase-config.js";

import NavBar from "../../components/navBar/index.jsx";
import ActionBar from "../../components/actionBar/index.jsx";
import TransactionsList from "../../components/transactionsList/index.jsx";
import Popup from "../../components/popUp/index.jsx";
import { decryptData } from "../../functions.jsx";

function Home() {
  const userInfo = JSON.parse(localStorage.getItem("auth"));

  const [isAuthenticated, setIsAuthenticated] = useState(
    userInfo ? userInfo.isAuth : false
  );

  const navigate = useNavigate();
  const location = useLocation();

  const [hora, setHora] = useState(new Date());

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [emailVerified, setEmailVerified] = useState(null);
  const [resendedEmail, setResendedEmail] = useState(false);

  const cardService = useRef(null);
  const cardService2 = useRef(null);
  const cardService3 = useRef(null);

  const iconIncomes = useRef(null);
  const iconExpenses = useRef(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const resendEmailVerification = async () => {
    setFetching(true);
    if (user) {
      try {
        await sendEmailVerification(user);
        console.log("Email de verificação reenviado");
      } catch (error) {
        console.error("Erro ao reenviar o email de verificação:", error);
      } finally {
        setFetching(false);
        setResendedEmail(true);
      }
    } else {
      console.log("Nenhum usuário autenticado");
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && !user.emailVerified) {
      setEmailVerified(false);
    } else if (user && user.emailVerified) {
      setEmailVerified(true);
    }
  }, [user]);

  useEffect(() => {
    if (iconIncomes.current) {
      iconIncomes.current.style.height = iconIncomes.current.offsetWidth + "px";
      iconExpenses.current.style.height =
        iconExpenses.current.offsetWidth + "px";
    }
  }, [iconIncomes]);

  const handleshowPopup = (message, type, id) => {
    setMessagePopup(message);
    setTypePopup(type);
    setShowPopup(true);
    setTransactionId(id);
  };

  const updateBalances = (filteredTransactions) => {
    let totalIncome = 0;
    let totalExpense = 0;
    filteredTransactions.forEach((transaction) => {
      const numericValue = parseFloat(decryptData(transaction.value));
      if (!isNaN(numericValue)) {
        if (transaction.type === "income") {
          totalIncome += numericValue;
        } else if (transaction.type === "expense") {
          totalExpense += numericValue;
        }
      }
    });
    setTotalIncomes(totalIncome);
    setTotalExpenses(totalExpense);
  };
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase(); // Converter o termo de busca para minúsculas
    setSearchTerm(term); // Atualizar o estado do termo de busca

    // Filtrar as transações que contenham o termo de busca no campo de descrição
    const filteredTransactions = transactions.filter(
      (transaction) =>
        decryptData(transaction.name).toLowerCase().includes(term) ||
        decryptData(transaction.value).toString().toLowerCase().includes(term)
    );

    updateBalances(filteredTransactions);
    setTotalResults(filteredTransactions.length);
    setSearchResults(filteredTransactions);
  };

  const handleFilterByType = (e, type) => {
    if (searchByType) {
      setSearchByType(false);
      setSearchTerm("");
      setSearchResults(transactions);
      setButtonIncomes(false);
      setButtonExpenses(false);

      return;
    }

    if (type === "income") {
      setButtonIncomes(true);
      setButtonExpenses(false);
    }

    if (type === "expense") {
      setButtonIncomes(false);
      setButtonExpenses(true);
    }

    let filteredTransactions = "";
    if (searchTerm) {
      filteredTransactions = searchResults.filter(
        (transaction) =>
          (transaction.type === type &&
            transaction.name.toLowerCase().includes(searchTerm)) ||
          (transaction.type === type &&
            transaction.value.toString().toLowerCase().includes(searchTerm))
      );
    } else {
      filteredTransactions = transactions.filter(
        (transaction) => transaction.type === type
      );
    }

    setSearchByType(true);
    setTotalResults(filteredTransactions.length);
    setSearchResults(filteredTransactions);
  };
  async function handleGetTransactions() {
    setFetching(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("uid", "==", userInfo.userID),
        orderBy("dateTime", "desc"),
        limit(5)
      );
      const transactions = await getDocs(q);
      const fetchedData = transactions.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTotalResults(fetchedData.length);
      setTransactions(fetchedData);

      const q2 = query(
        collection(db, "transactions"),
        where("uid", "==", userInfo.userID),
        where("type", "==", "expense")
      );
      const expenses = await getDocs(q2);

      const totalExpenses = expenses.docs.reduce((acc, doc) => {
        return acc + parseFloat(decryptData(doc.data().value));
      }, 0);
      setTotalExpenses(totalExpenses);

      const q3 = query(
        collection(db, "transactions"),
        where("uid", "==", userInfo.userID),
        where("type", "==", "income")
      );
      const incomes = await getDocs(q3);

      const totalIncomes = incomes.docs.reduce((acc, doc) => {
        return acc + parseFloat(decryptData(doc.data().value));
      }, 0);

      setTotalIncomes(totalIncomes);

      const totalBalance = totalIncomes - totalExpenses;
      setTotalBalance(totalBalance);
      setFetching(false);
    } catch (error) {
      console.error("Erro ao buscar dados do Firestore:", error);
    }
  }

  useEffect(() => {
    location.pathname === "/" && handleGetTransactions();
  }, [location]);

  useEffect(() => {
    if (location.pathname === "/") {
     if (cardService.current) {
       cardService.current.style.height = cardService.current.offsetWidth + "px";
       cardService2.current.style.height = cardService2.current.offsetWidth + "px";
       cardService3.current.style.height = cardService3.current.offsetWidth + "px";
     }
    }
 }, [location, cardService]);

  const formatDate = (dateInfo) => {
    var date = new Date(dateInfo);
    var timestamp = date.getTime();
    const tomorrowDate = new Date(timestamp);
    const tomorrowHours = new Date();

    tomorrowDate.setDate(tomorrowDate.getDate());
    const dia = String(tomorrowDate.getDate()).padStart(2, "0");
    const mes = String(tomorrowDate.getMonth() + 1).padStart(2, "0");
    const data = tomorrowDate.getFullYear() + "-" + mes + "-" + dia;
    let completeDate =
      data +
      "T" +
      String(tomorrowHours.getHours()).padStart(2, "0") +
      ":" +
      String(tomorrowHours.getMinutes()).padStart(2, "0") +
      ":00";

    return completeDate;
  };

  function handleFilterDateChange(event) {
    if (filterDate === event.target.value) {
      setFilterDate(null);
      handleGetTransactions();
      return;
    } else {
      setFilterDate(event.target.value);
    }
    const dateValue = event.target.value;

    let selectedDate = "";
    if (dateValue === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      selectedDate = yesterday;
    } else if (
      dateValue === "today" ||
      dateValue === "month" ||
      dateValue === "year"
    ) {
      selectedDate = new Date();
    } else if (dateValue === "week") {
    }

    const filteredTransactions = transactions.filter((transaction) => {
      let transactionDate = new Date(transaction.dateTime);
      transactionDate = formatDate(transactionDate);
      selectedDate = formatDate(selectedDate);
      transactionDate = new Date(
        transactionDate.split("T")[0].split("-").join("/")
      );
      selectedDate = new Date(selectedDate.split("T")[0].split("-").join("/"));

      if (dateValue === "month") {
        return transactionDate.getMonth() + 1 === selectedDate.getMonth() + 1;
      } else if (dateValue === "year") {
        return transactionDate.getFullYear() === selectedDate.getFullYear();
      } else if (dateValue === "week") {
        let currentDate = new Date();
        let startDate = new Date(currentDate.getFullYear(), 0, 1);
        let days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
        let currentWeek = Math.ceil(days / 7);
        
        let days2 = Math.floor((transactionDate - startDate) / (24 * 60 * 60 * 1000));
        let transactionWeek = Math.ceil(days2 / 7);
        if (transactionDate.getUTCDay() === 0) { transactionWeek += 1 };

        return transactionWeek === currentWeek;
      } else if (dateValue === "today" || dateValue === "yesterday") {
        return (
          transactionDate.getDate() === selectedDate.getDate() &&
          transactionDate.getMonth() + 1 === selectedDate.getMonth() + 1 &&
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
      const transactionRef = doc(db, "transactions", transactionId);

      await deleteDoc(transactionRef);

      handleGetTransactions();
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  }
  return isAuthenticated ? (
    <>
    
      {emailVerified === null && <div className="loaderContainer"><div className="mainLoader"></div></div>}

      {emailVerified === false ? (
        <div className="unverified">
          <NavBar />
          <h3>Seu email ainda não foi verificado.</h3>
          <p>
            Se ainda não recebeu o email de verificação, clique no botão abaixo.
          </p>
          <button className="btnPrimary" onClick={resendEmailVerification}>
            {!fetching ? (
              resendedEmail ? (
                "Enviar novamente"
              ) : (
                "Reenviar email"
              )
            ) : (
              <span className="loader2"></span>
            )}
          </button>
          <br />
          {resendedEmail && (
            <small>
              <strong>Email de verificação reenviado.</strong>
            </small>
          )}
          <small>Verifique a caixa de Spam e lixo eletrônico.</small>
          <br />
          <a href="/">
            <button className="btnPrimary">Recarregar página</button>
          </a>
        </div>
      ) : (
        <>
          {emailVerified !== null && <><NavBar /><ActionBar/></>}
          {location.pathname === "/" ? (
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
              <h3 className="welcome">
                Olá,{" "}
                <span className="userName">
                  {userInfo.displayName ? userInfo.displayName : userInfo.email}
                </span>
              </h3>

              <div className="cards-informations">
                <div className="card-info card-balance">
                  <i></i>
                  <div className="content">
                    <h4 className={fetching ? "loadingElement" : ""}>Saldo:</h4>
                    <span
                      className={
                        fetching ? "useSecurity loadingElement" : "useSecurity"
                      }
                    >
                      R$ {parseFloat(totalBalance).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    buttonIncomes
                      ? "card-info card-incomes filtered"
                      : "card-info card-incomes"
                  }
                  // onClick={(e) => handleFilterByType(e, "income")}
                >
                  <i ref={iconIncomes}></i>
                  <div className="content">
                    <h4 className={fetching ? "loadingElement" : ""}>
                      Entradas:
                    </h4>
                    <span
                      className={
                        fetching ? "useSecurity loadingElement" : "useSecurity"
                      }
                    >
                      R$ {parseFloat(totalIncomes).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    buttonExpenses
                      ? "card-info card-expenses filtered"
                      : "card-info card-expenses"
                  }
                  // onClick={(e) => handleFilterByType(e, "expense")}
                >
                  <i ref={iconExpenses}></i>
                  <div className="content">
                    <h4 className={fetching ? "loadingElement" : ""}>
                      Saídas:
                    </h4>
                    <span
                      className={
                        fetching ? "useSecurity loadingElement" : "useSecurity"
                      }
                    >
                      R$ {parseFloat(totalExpenses).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="services">
                <h3>Serviços</h3>
                <button ref={cardService} id="new-transaction" className="card-service" onClick={() => navigate("/new-transaction")}>
                  <i></i>
                  <span>Nova Transação</span>
                </button>

                <button ref={cardService2} id="transactions" className="card-service" onClick={() => navigate("/transactions")}>
                  <i></i>
                  <span>Transações</span>
                </button>

                <button ref={cardService3} id="profile" className="card-service" onClick={() => navigate("/profile")}>
                  <i></i>
                  <span>Perfil</span>
                </button>
              </div>

              <div className="transactions">
                <h4 style={{ marginBottom: "0px" }}>Ultimas transações:</h4>
                <small className={fetching ? "loadingElement" : ""}>
                  {totalResults} transações encontradas
                </small>

                {fetching ? (
                  <ul className="transactions-list">
                    <li className="cardSkeleton"></li>
                    <li className="cardSkeleton"></li>
                  </ul>
                ) : (
                  <>
                    <TransactionsList
                      transactions={transactions}
                      searchTerm={searchTerm}
                      searchResults={searchResults}
                      searchByType={searchByType}
                      filterDate={filterDate}
                      handleGetTransactions={handleGetTransactions}
                      handleshowPopup={handleshowPopup}
                    />
                    <button className="view-all-transactions btnPrimary" onClick={() => navigate("/transactions")}>Ver todas as transações</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </>
      )}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default Home;
