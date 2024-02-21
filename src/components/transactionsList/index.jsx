import React from "react";
import TransactionCard from "../transactionCard";

export default function TransactionsList({ transactions, handleGetTransactions, searchTerm, searchResults, searchByType, filterDate, handleshowPopup }) {
  return (
    <ul className="transactions-list">
    {!filterDate && searchTerm === '' && !searchByType && transactions.map((item, index) => (
      <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} handleshowPopup={handleshowPopup}/>
    ))}
    {!filterDate ? (
      searchTerm === '' && !searchByType && transactions.map((item, index) => (
        <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} handleshowPopup={handleshowPopup}/>
      )),
      searchByType && searchResults.map((item, index) => (
        <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} handleshowPopup={handleshowPopup}/>
      )),
      searchTerm !== '' && !searchByType && searchResults.map((item, index) => (
        <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} handleshowPopup={handleshowPopup}/>
      ))
    ) : (
      filterDate && searchResults.map((item, index) => (
        <TransactionCard key={item.id} item={item} handleGetTransactions={handleGetTransactions} handleshowPopup={handleshowPopup}/>
      ))
    )}
  </ul>
  );
}