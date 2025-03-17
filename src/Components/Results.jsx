import { useState, useEffect } from "react";

function Results({ filteredRoutes, validUntil }) {
    const [sortOrder, setSortOrder] = useState('none'); // 'none', 'price', 'time'
    // pretty much default sorting is 'as is'. Fairly random i guess.

    // calculate flight time in hours
    const calculateFlightTime = (flightStart, flightEnd) => {
        const startDate = new Date(flightStart);
        const endDate = new Date(flightEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return "Invalid date";
        }

        const timeDifference = endDate - startDate;
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        return `${hours} hours`;
    };

    // check if results are still valid
    const areResultsValid = () => {
        if (!validUntil) return true;
        return new Date() < new Date(validUntil);
    };

    // format the validUntil timestamp
    const formatValidUntil = (validUntil) => {
        if (!validUntil) return "N/A";
        const date = new Date(validUntil);
        return date.toLocaleString();
    };

    // compute sorted routes based on sortOrder
    function getSortedRoutes() {
        if (sortOrder === 'none') {
            return filteredRoutes;
        }
        
        return filteredRoutes.map(leg => {
            // Create a copy of the leg
            const newLeg = {...leg};
            
            // Sort the providers within each leg
            if (sortOrder === 'price') {
                newLeg.providers = [...leg.providers].sort((a, b) => {
                    return (a.price || Infinity) - (b.price || Infinity);
                });
            } else if (sortOrder === 'time') {
                newLeg.providers = [...leg.providers].sort((a, b) => {
                    const timeA = a.flightStart && a.flightEnd ? 
                        new Date(a.flightEnd) - new Date(a.flightStart) : Infinity;
                    const timeB = b.flightStart && b.flightEnd ? 
                        new Date(b.flightEnd) - new Date(b.flightStart) : Infinity;
                    return timeA - timeB;
                });
            }
            
            return newLeg;
        });
    }

    const sortedRoutes = getSortedRoutes();

    // reset sort order when routes change
    useEffect(() => {
        setSortOrder('none');
    }, [filteredRoutes]);

    // reserve functionality
    function handleReserve(provider, routeInfo) {
        // Ask for first and last name
        const firstName = prompt("Please enter your first name:");
        if (!firstName) {
            alert('You need to give your first name!');
            return; // Cancel if empty

        } 
        
        const lastName = prompt("Please enter your last name:");
        if (!lastName) {
            alert('You need to give your last name!');
            return; // Cancel if empty

        }         

        // create reservation object
        const reservation = {
            id: Date.now(), // Simple unique ID
            firstName: firstName,
            lastName: lastName,
            provider: provider,
            routeInfo: routeInfo,
            validUntil: validUntil,
            reservationDate: new Date().toISOString()
        };
        
        // get existing reservations from localStorage
        const existingReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        
        // add new reservation
        const updatedReservations = [...existingReservations, reservation];
        
        // save to localStorage
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
        
        // confirm reservation
        alert(`Reservation confirmed for ${firstName} ${lastName}!`);
    }

    return (
        <>
            {!areResultsValid() && (
                <div className="expired-message">
                    <p style={{ color: 'red' }}>The search results have expired. Please refresh your search.</p>
                </div>
            )}

            {filteredRoutes.length > 0 && areResultsValid() ? (
                <div className="results">
                    <h2>RESULTS:</h2>
                    <div className="sort-buttons">
                        <button 
                            onClick={() => setSortOrder('price')}
                            className={sortOrder === 'price' ? 'active-sort' : ''}
                            style={sortOrder === 'price' ? { backgroundColor: 'green' } : {}}
                        >
                            REORDER BY PRICE {sortOrder === 'price' ? 'X' : ''}
                        </button>
                        <button 
                            onClick={() => setSortOrder('time')}
                            className={sortOrder === 'time' ? 'active-sort' : ''}
                            style={sortOrder === 'time' ? { backgroundColor: 'green' } : {}}
                        >
                            REORDER BY TIME {sortOrder === 'time' ? 'X' : ''}
                        </button>
                        {sortOrder !== 'none' && (
                            <button onClick={() => setSortOrder('none')}>
                                CLEAR SORTING
                            </button>
                        )}
                    </div>
                    <p><strong>Valid until:</strong> {formatValidUntil(validUntil)}</p>
                    {sortedRoutes.map((leg, index) => (
                        <div key={index} className="route">
                            <h3>Route: {leg.routeInfo.from.name} → {leg.routeInfo.to.name}</h3>
                            <ul>
                                {leg.providers.map((provider, providerIndex) => {
                                    if (!provider.flightStart || !provider.flightEnd) return null;
                                    return (
                                        <li key={providerIndex}>
                                            <p>---</p>
                                            <p><strong>Company:</strong> {provider.company.name}</p>
                                            <p><strong>Price:</strong> ${provider.price}</p>
                                            <p><strong>Flight Start:</strong> {new Date(provider.flightStart).toLocaleString()}</p>
                                            <p><strong>Flight End:</strong> {new Date(provider.flightEnd).toLocaleString()}</p>
                                            <p><strong>Flight Time:</strong> {calculateFlightTime(provider.flightStart, provider.flightEnd)}</p>
                                            <button onClick={() => handleReserve(provider, leg.routeInfo)}>RESERVE</button>
                                            <p>---</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : areResultsValid() ? (
                <div className="no-results">
                    <p>No routes found matching your criteria. Please try different options.</p>
                </div>
            ) : null}
        </>
    );
}

export default Results;