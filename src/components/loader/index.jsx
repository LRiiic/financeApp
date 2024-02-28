import { React } from "react";
import './style.css'


function Loader() {
  return (
    <div className="loader-container">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 56 56" width="56" height="56" fill="none" stroke="#00594c"    strokeWidth="1.7px"><path className="logoAnimation" d="m8 30c0 0 0.3-22 20-22 0 0.1 0 10 0 10 0 0-10 0.6-10 12 0.1 0-10 0-10 0z"/><path className="logoAnimation" d="m9 50c0 0 0.3-22 20-22 0 0.1 0 10 0 10 0 0-10 0.6-10 12 0.1 0-10 0-10 0z"/><path className="logoAnimation" d="m51 26c0 0-0.3 22-20 22 0-0.1 0-10 0-10 0 0 10-0.6 10-12-0.1 0 10 0 10 0z"/><path className="logoAnimation" d="m50 6c0 0-0.3 22-20 22 0-0.1 0-10 0-10 0 0 10-0.6 10-12-0.1 0 10 0 10 0z"/></svg>
    </div>
  )
}

export default Loader;