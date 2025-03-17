import { useState, useEffect } from "react";

// uses vite proxy because of CORS issues
// original URL is: https://cosmosodyssey.azurewebsites.net
const APIURL = '/api';

function SearchBar({ setFilteredRoutes, setValidUntil }) {

    const [planets, setPlanets] = useState([]); // store the planet names
    const [companies, setCompanies] = useState([]); // store the company names
    const [legs, setLegs] = useState([]); // store the "legs" (the possible routes)
    const [fromPlanet, setFromPlanet] = useState(''); // track the selected "from" planet
    const [toPlanet, setToPlanet] = useState(''); // track the selected "to" planet
    const [selectedCompanies, setSelectedCompanies] = useState([]); // track the selected companies

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(APIURL);
            const data = await response.json();

            setLegs(data.legs); // store the legs
            setValidUntil(data.validUntil); // store the validUntil timestamp

            // store this new pricelist
            storePricelist(data);

            // extract unique planet and company names
            // sets are unique
            const planetNames = new Set();
            const companyNames = new Set();


            // (could also use a standard for loop)
            // add the planets and companies
            data.legs.forEach((leg) => {
                planetNames.add(leg.routeInfo.from.name);
                planetNames.add(leg.routeInfo.to.name);
                leg.providers.forEach((provider) => {
                    companyNames.add(provider.company.name);
                });
            });

            const companiesArray = [...companyNames];
            // its easier to use arrays when dealing with checkboxes etc.
            setPlanets([...planetNames]); // convert Set to array
            setCompanies(companiesArray); // convert Set to array
            setSelectedCompanies(companiesArray); // select ALL by default
        };

        fetchData();
    }, [setValidUntil]);

    // store pricelist in localStorage, keeping only the most recent 15
    function storePricelist(pricelist) {
        // get existing pricelists
        const storedPricelists = JSON.parse(localStorage.getItem('pricelists') || '[]');
        
        // add new pricelist (no need to check for duplicates since API calls are infrequent)
        storedPricelists.push(pricelist);
        
        // sort by date (newest first) and keep only the most recent 15
        storedPricelists.sort((a, b) => new Date(b.validUntil) - new Date(a.validUntil));
        const latestPricelists = storedPricelists.slice(0, 15);
        
        // save to localStorage
        localStorage.setItem('pricelists', JSON.stringify(latestPricelists));
        
        // clean up reservations in one simple step
        cleanupReservations(latestPricelists);
    }

    // remove reservations that don't match any active pricelist
    function cleanupReservations(activePricelists) {
        const activeValidUntilDates = activePricelists.map(pricelist => pricelist.validUntil);
        const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        
        const activeReservations = savedReservations.filter(reservation => 
            activeValidUntilDates.includes(reservation.validUntil)
        );
        
        localStorage.setItem('reservations', JSON.stringify(activeReservations));
    }

    // handle company selection
    const handleCompanyChange = (company) => {
        if (selectedCompanies.includes(company)) {
            // remove the company
            const updatedCompanies = selectedCompanies.filter(c => c !== company);
            setSelectedCompanies(updatedCompanies);
        } else {
            // add the company
            const updatedCompanies = [...selectedCompanies, company];
            setSelectedCompanies(updatedCompanies);
        }
    };

    // function to select all companies
    function SelectAll() {
        setSelectedCompanies([...companies]);
    }

    // function to deselect all companies
    function SelectNone() {
        setSelectedCompanies([]);
    }

    // functon to switch the from/to values
    function switchFromTo() {
        // store the current "from" value in a temporary variable
        const temp = fromPlanet;
        // set "from" to the current "to" value
        setFromPlanet(toPlanet);
        // set "to" to the stored "from" value
        setToPlanet(temp);
    }

    // find routes based on selected planets and companies
    function findRoutes() {
        // validate planet selection
        if (!fromPlanet || !toPlanet) {
            alert("Please select both departure and destination planets");
            return;
        }
        
        // check if any companies are selected before filtering
        if (selectedCompanies.length === 0) {
            alert("Please select a company");
            return;
        }
        
        const filteredRoutes = legs.filter((leg) => {
            const fromPlanetName = leg.routeInfo.from.name;
            const toPlanetName = leg.routeInfo.to.name;
            
            // check planets match
            const planetsMatch = fromPlanetName === fromPlanet && toPlanetName === toPlanet;
            
            // filter by selected companies
            return planetsMatch && leg.providers.some((provider) =>
                selectedCompanies.includes(provider.company.name)
            );
        });

        setFilteredRoutes(filteredRoutes); // Pass filtered routes to App.jsx
    };

    return (
        <>
            <div className="selectors">
                <button onClick={SelectAll}>SELECT ALL</button>
                <button onClick={SelectNone}>SELECT NONE</button>
            </div>
            
            <div className="search-div">
                <select 
                    className="from-select" 
                    value={fromPlanet} 
                    onChange={(e) => setFromPlanet(e.target.value)}
                >
                    <option value="">Select From Planet</option>
                    {planets.map((planet, index) => (
                        <option key={index} value={planet}>{planet}</option>
                    ))}
                </select>

                {/* --- INBETWEEN BUTTON --- */ }
                <button onClick={switchFromTo}style={{ color: 'white', backgroundColor: 'blue',  fontSize: '10px'}}>↔</button>
                {/* --- INBETWEEN BUTTON --- */ }


                <select 
                    className="to-select" 
                    value={toPlanet} 
                    onChange={(e) => setToPlanet(e.target.value)}
                >
                    <option value="">Select To Planet</option>
                    {planets.map((planet, index) => (
                        <option key={index} value={planet}>{planet}</option>
                    ))}
                </select>

                <div className="company-select">
                    {companies.map((company, index) => (
                        <label key={index}>
                            <input 
                                type="checkbox" 
                                checked={selectedCompanies.includes(company)}
                                onChange={() => handleCompanyChange(company)}
                            /> 
                            {company}
                        </label>
                    ))}
                </div>

                <button className="routes-btn" onClick={findRoutes}>FIND ROUTES</button>
            </div>
        </>
    );
}

export default SearchBar;