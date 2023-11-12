import React, { useEffect, useState, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import SignUp from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CopaymentCalculator from "./pages/CopaymentCalculator";
import Userplan from './pages/Userplan';

export default function App() {
    return (
        <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="forgetPassword" element={<ForgetPassword />}/>
        <Route path="Signup" element={<SignUp />} />
        <Route path="Dashboard" element={<Dashboard />} />
        <Route path="copaymentCalculator" element={<CopaymentCalculator />} />
        <Route path="signUp" element={<SignUp/>}></Route>
          <Route path="UserPlan" element={<Userplan/>}></Route>
      </Routes>
    </div>
    );
}