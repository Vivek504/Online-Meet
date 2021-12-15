import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home/Home.js';
import Meet from './Meet/Meet.js';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="meet/:meet_code" element={<Meet />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
