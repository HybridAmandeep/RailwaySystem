// Train search and display functionality

// Station autocomplete
let stationsCache = [];

// Initialize autocomplete
document.addEventListener('DOMContentLoaded', () => {
    initAutocomplete();
    initSwapButton();
    initSearchForm();
});

// Fetch stations for autocomplete
async function fetchStations(query) {
    try {
        const response = await fetch(`/api/stations?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        const data = await response.json();
        return data.stations || [];
    } catch (error) {
        console.error('Error fetching stations:', error);
        return [];
    }
}

// Initialize autocomplete for station inputs
function initAutocomplete() {
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const fromResults = document.getElementById('fromResults');
    const toResults = document.getElementById('toResults');

    if (fromInput && fromResults) {
        setupAutocomplete(fromInput, fromResults, 'fromStationCode');
    }

    if (toInput && toResults) {
        setupAutocomplete(toInput, toResults, 'toStationCode');
    }
}

// Setup autocomplete for an input
function setupAutocomplete(input, results, hiddenField) {
    let debounceTimer;

    input.addEventListener('input', async (e) => {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            results.classList.remove('show');
            return;
        }

        debounceTimer = setTimeout(async () => {
            const stations = await fetchStations(query);

            if (stations.length > 0) {
                results.innerHTML = stations.map(station => `
                    <div class="autocomplete-item" data-code="${station.station_code}" data-name="${station.station_name}">
                        <span class="station-code">${station.station_code}</span>
                        <span class="station-name">${station.station_name}</span>
                        <span class="station-city">${station.city}, ${station.state}</span>
                    </div>
                `).join('');
                results.classList.add('show');

                // Add click handlers
                results.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = `${item.dataset.code} - ${item.dataset.name}`;
                        document.getElementById(hiddenField).value = item.dataset.code;
                        results.classList.remove('show');
                    });
                });
            } else {
                results.innerHTML = '<div class="autocomplete-item">No stations found</div>';
                results.classList.add('show');
            }
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            results.classList.remove('show');
        }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            results.classList.remove('show');
        }
    });
}

// Initialize swap button
function initSwapButton() {
    const swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const fromInput = document.getElementById('fromStation');
            const toInput = document.getElementById('toStation');
            const fromCode = document.getElementById('fromStationCode');
            const toCode = document.getElementById('toStationCode');

            // Swap values
            const tempValue = fromInput.value;
            const tempCode = fromCode.value;

            fromInput.value = toInput.value;
            fromCode.value = toCode.value;

            toInput.value = tempValue;
            toCode.value = tempCode;
        });
    }
}

// Initialize search form
function initSearchForm() {
    const form = document.getElementById('trainSearchForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const fromCode = document.getElementById('fromStationCode').value ||
                document.getElementById('fromStation').value.split(' - ')[0].trim();
            const toCode = document.getElementById('toStationCode').value ||
                document.getElementById('toStation').value.split(' - ')[0].trim();
            const date = document.getElementById('journeyDate').value;
            const travelClass = document.getElementById('travelClass').value;

            if (!fromCode || !toCode) {
                alert('Please select source and destination stations');
                return;
            }

            if (!date) {
                alert('Please select a journey date');
                return;
            }

            // Redirect to trains page
            let url = `/trains.html?from=${fromCode}&to=${toCode}&date=${date}`;
            if (travelClass) {
                url += `&class=${travelClass}`;
            }

            window.location.href = url;
        });
    }
}
