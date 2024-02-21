import React from "react";

export default function Profile() {
  const userInfo = JSON.parse(localStorage.getItem('auth'));

  return (
    <div>
      <h1 className="title">Perfil</h1>
      <p><strong>Nome:</strong> <span>{userInfo.displayName ? userInfo.displayName : '-'}</span></p>
      <p><strong>Email:</strong> <span>{userInfo.email ? userInfo.email : '-'}</span></p>
    </div>
  );
}