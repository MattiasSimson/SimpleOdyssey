import './App.css';
import { useState } from 'react';
import SearchBar from './Components/SearchBar';
import Results from './Components/Results';
import Reservations from './Components/Reservations';

function App() {
    const [filteredRoutes, setFilteredRoutes] = useState([]); // State to store filtered routes
    const [validUntil, setValidUntil] = useState(null); // State to store validUntil timestamp
    const [currentPage, setCurrentPage] = useState('search'); // 'search' or 'reservations'

    console.log("Filtered Routes in App:", filteredRoutes); // Debugging log

    return (
        <>
            <div className="page-buttons" 
            style={{
                margin: '5vh',
            }}>
                <h2>Select page:</h2>
                <button 
                    onClick={() => setCurrentPage('search')}
                    className={currentPage === 'search' ? 'active-page' : ''}
                >
                    SEARCH
                </button>
                <button 
                    onClick={() => setCurrentPage('reservations')}
                    className={currentPage === 'reservations' ? 'active-page' : ''}
                >
                    RESERVATIONS
                </button>
            </div>
            
            {currentPage === 'search' ? (
                
                <>
                <h2>Search: </h2>
                    <SearchBar setFilteredRoutes={setFilteredRoutes} setValidUntil={setValidUntil} />
                    <Results filteredRoutes={filteredRoutes} validUntil={validUntil} />
                </>
            ) : (
                <Reservations />
            )}
        </>
    );
}

export default App;