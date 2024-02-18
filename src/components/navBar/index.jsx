import { React } from "react";
import financeFlexLogo from '../../assets/finance-flex.svg'
import '../../index.css';


function NavBar() {
  return (
    <nav>
      <h1>
        <a href="/">
          <img src={financeFlexLogo} alt="Finance Flex logo" width="250"/>
        </a>
      </h1>
    </nav>
  );
}

export default NavBar;