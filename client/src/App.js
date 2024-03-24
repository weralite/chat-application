import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegisterUser from './components/registerUser';
import LoginUser from './components/loginUser';
import Chat from './components/chat';


function App() {

  return (
    <>

        <Routes>
          <Route path="/" element={<RegisterUser />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>

    </>
  );
}

export default App;
