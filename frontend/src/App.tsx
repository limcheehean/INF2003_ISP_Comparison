import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';

export default function App() {
    return (
        <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="forgetPassword" element={<ForgetPassword />}/>
      </Routes>
    </div>
    );
}