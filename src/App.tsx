import { Suspense } from 'react';
import Routing from './routes/Routing';

import { BrowserRouter } from 'react-router-dom';

import './App.css';

function App() {
    const userRole = 'user'; // Example role
    // const isAuthenticated = localStorage.getItem('isAuthenticated'); // Example auth status
    const authFromStorage = localStorage.getItem('isAuthenticated');
    const isAuthenticated: boolean = authFromStorage ? authFromStorage === 'true' : false;

    return (
        <Suspense fallback={'Loading...'}>
            <BrowserRouter>
                <Routing
                    userRole={userRole}
                    isAuthenticated={isAuthenticated}
                />
            </BrowserRouter>
        </Suspense>
    );
}

export default App;
