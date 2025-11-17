import { Suspense } from 'react';
import Routing from './routes/Routing';

import { BrowserRouter } from 'react-router-dom';

import './App.css';

function App() {
    const userRole = 'user'; // Example role
    const isAuthenticated = false; // Example auth status

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
