import React, { useEffect, useState, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import SignUp from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="forgetPassword" element={<ForgetPassword />}/>
          <Route path="Signup" element={<SignUp />} />
          <ProtectedRoute>
            {isAuthenticated => (
              isAuthenticated ? (
                // Content for authenticated users
                <Route path="Dashboard" element={<Dashboard />} />
              ) : (
                // Content for unauthenticated users
                <Navigate to="/login" />
              )
            )}
          </ProtectedRoute>
          
        </Routes>
    </div>
    );
}