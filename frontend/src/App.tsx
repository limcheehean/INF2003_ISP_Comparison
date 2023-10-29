import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import SignUp from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
    return (
        <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="forgetPassword" element={<ForgetPassword />}/>
        <Route path="Signup" element={<SignUp />} />
        <Route path="Dashboard" element={<Dashboard />} />
      </Routes>
    </div>
    );
}