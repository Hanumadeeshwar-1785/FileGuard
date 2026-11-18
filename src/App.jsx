import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FileGuardProvider } from './context/FileGuardContext';
import AndroidFrame from './components/AndroidFrame';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import EncryptScreen from './screens/EncryptScreen';
import DecryptScreen from './screens/DecryptScreen';
import HistoryScreen from './screens/HistoryScreen';
import SecurityScreen from './screens/SecurityScreen';
import AboutScreen from './screens/AboutScreen';

import './App.css';

export default function App() {
  return (
    <FileGuardProvider>
      <HashRouter>
        <AndroidFrame>
          <Routes>
            {/* 1. Splash Screen */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/splash" element={<SplashScreen />} />

            {/* 2. Home Screen */}
            <Route path="/home" element={<HomeScreen />} />

            {/* 3. Encrypt File Screen */}
            <Route path="/encrypt" element={<EncryptScreen />} />

            {/* 4. Decrypt File Screen */}
            <Route path="/decrypt" element={<DecryptScreen />} />

            {/* 5. File History Screen */}
            <Route path="/history" element={<HistoryScreen />} />

            {/* 6. Security Information Screen */}
            <Route path="/security" element={<SecurityScreen />} />

            {/* 7. About Screen */}
            <Route path="/about" element={<AboutScreen />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AndroidFrame>
      </HashRouter>
    </FileGuardProvider>
  );
}
