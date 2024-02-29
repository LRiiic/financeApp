import { React } from "react";
import Carousel from "../carousel";
import './style.css';

import step1 from '../../assets/tutorial/step1.svg';
import step2 from "../../assets/tutorial/step2.svg";
import step3 from "../../assets/tutorial/step3.svg";
import step4 from "../../assets/tutorial/step4.svg";
import step5 from "../../assets/tutorial/step5.svg";
import step6 from "../../assets/tutorial/step6.svg";



function Tutorial(props) {
  return (
    <>
      <div className="tutorial">
        <div className="container">
          <h2>Tutorial</h2>
          <Carousel>
            <div className="slide">
              <img src={step1} alt="Passo 1" />
              <h3>1. Página inicial</h3>
              <p>Na página inicial você vai poder ver rapidamente seu saldo atual, suas entradas e saídas, terá acesso rápido a todos os serviços de sua conta e terá em vista suas últimas 5 transações.</p>
            </div>

            <div className="slide">
              <img src={step2} alt="Passo 2" />
              <h3>2. Serviços</h3>
              <p>Ainda na página inicial você terá atalhos para criar uma nova transação, visualizar todas as transações e acessar seu perfil.</p>
            </div>

            <div className="slide">
              <img src={step3} alt="Passo 3" />
              <h3>3. Nova Transação</h3>
              <p>Lugar onde você irá criar uma nova transação seja ela uma entrada ou saída.</p>
            </div>

            <div className="slide">
              <img src={step4} alt="Passo 4" />
              <h3>4. Transações</h3>
              <p>Página que mostrará um resumo de todas as suas transações, contento barra de pesquisa e filtros para uma melhor análise.</p>
            </div>   

            <div className="slide">
              <img src={step5} alt="Passo 5" />
              <h3>5. Perfil</h3>
              <p>Página que mostrará seus dados pessoais.</p>
            </div>   

            <div className="slide">
              <img src={step6} alt="Passo 6" />
              <h3>Concluído</h3>
              <p>Isso é tudo! Você está apto para começar a utilizar nosso aplicativo e organizar suas finanças.</p>
            </div>        
          </Carousel>

          <button className="close-tutorial" onClick={props.handleCloseTutorial}>Fechar tutorial</button>
        </div>
      </div>
    </>
  )
}

export default Tutorial;