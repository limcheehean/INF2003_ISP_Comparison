import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from "./pages/Dashboard";
import CopaymentCalculator from "./pages/CopaymentCalculator";
import SignUp from './pages/Signup';
import UserPlan from './pages/UserPlan';

export default function App() {
    return (
        <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="forgetPassword" element={<ForgetPassword />}/>
        <Route path="resetPassword/:resetToken" element={<ResetPassword />}/>
        <Route path="Dashboard" element={<Dashboard />} />
        <Route path="copaymentCalculator" element={<CopaymentCalculator />} />
        <Route path="signUp" element={<SignUp/>}></Route>
        <Route path="UserPlan" element={<UserPlan/>}></Route>
      </Routes>
    </div>
    );
}