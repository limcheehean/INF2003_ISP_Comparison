import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
    return (
        <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="forgetPassword" element={<ForgetPassword />}/>
        <Route path="resetPassword/:resetToken" element={<ResetPassword />}/>
      </Routes>
    </div>
    );
}