import React from 'react';
import 'primeicons/primeicons.css';  
import 'primereact/resources/primereact.min.css'; 
import 'primereact/resources/themes/lara-light-indigo/theme.css';  
import 'primeflex/primeflex.css';

import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';  // Tu componente de rutas

function App() {
    return (
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    );
}

export default App;
