import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegisterUser from './components/registerUser';
import LoginUser from './components/loginUser';
import Chat from './components/chat/chat';




function App() {
  

  return (
    <>

        <Routes>
          <Route path="/" element={<LoginUser />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>

    </>
  );
}

export default App;
