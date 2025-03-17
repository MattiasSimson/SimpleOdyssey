import { useState, useEffect } from "react";

function Reservations() {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        // just load reservations from localStorage - they're already filtered by SearchBar
        const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        setReservations(savedReservations);
    }, []); // does it once

    // check if a reservation is still valid
    function isReservationValid(validUntil) {
        if (!validUntil) return false;
        return new Date() < new Date(validUntil);
    }

    // format the date for display
    function formatDate(dateString) {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    }

    // delete ALL resevations 
    function deleteReservations() {
        if (window.confirm("Are you sure you want to delete all reservations?")) {
            localStorage.removeItem('reservations');
            setReservations([]); // makes it empty again
        }
    }

    // delete a single reservation
    function deleteThis(reservationId) {
        if (window.confirm("Are you sure you want to delete this reservation?")) {
            // filter out the reservation with the matching id
            const updatedReservations = reservations.filter(function(reservation) {
                return reservation.id !== reservationId;
            });
            
            // update localStorage with the filtered array
            localStorage.setItem('reservations', JSON.stringify(updatedReservations));
            
            // update state
            setReservations(updatedReservations);
        }
    }

    return (
        <div className="reservations">
            <h2>YOUR RESERVATIONS</h2>
            <button onClick={deleteReservations} style={{color: 'red', fontSize: '20px'}}>DELETE ALL RESERVATIONS</button>
            
            {reservations.length === 0 ? (
                <p style={{color: 'red'}}>You don't have any reservations yet.</p>
            ) : (
                <div className="reservation-list">
                    {reservations.map((reservation) => 
                        <div key={reservation.id} className="reservation-card">
                            <h3>Reservation for: {reservation.firstName} {reservation.lastName}</h3>
                            <p>Route: {reservation.routeInfo.from.name} → {reservation.routeInfo.to.name}</p>
                            <p>Company: {reservation.provider.company.name}</p>
                            <p>Price: ${reservation.provider.price}</p>
                            <p>Flight Start: {formatDate(reservation.provider.flightStart)}</p>
                            <p>Flight End: {formatDate(reservation.provider.flightEnd)}</p>
                            <p>Reservation Date: {formatDate(reservation.reservationDate)}</p>
                            <p><strong>Expires On:</strong> {formatDate(reservation.validUntil)}</p>
                            
                            {isReservationValid(reservation.validUntil) ? (
                                <p className="valid-reservation" style={{ color: 'green' }}>This reservation is valid</p>
                            ) : (
                                <p className="invalid-reservation" style={{ color: 'red' }}>This reservation is not valid</p>
                            )}

                            <button onClick={function() { deleteThis(reservation.id); }} style={{color: 'red', fontSize: '10px'}}>DELETE THIS RESERVATION</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Reservations; 