// API Configuration
const API_BASE = '';  // Empty for same-origin requests

// Calendar variables
let currentCalendarDate = new Date();
let selectedDate = null;

// Data storage (will be loaded from API)
let requests = [];
let bucketList = [];
let availability = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}/api${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Initialize the main application
async function initializeApp() {
    // Initialize app components
    updateDate();
    await loadAllData();
}

// Load all data from API
async function loadAllData() {
    try {
        await Promise.all([
            loadRequests(),
            loadBucketList(),
            loadTodaysFeelings(),
            loadAvailabilityData()
        ]);
        initializeCalendar();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Update current date display
function updateDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Request functionality
async function addRequest() {
    const input = document.getElementById('requestInput');
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter a request! 💕');
        return;
    }

    try {
        const newRequest = await apiCall('/requests', {
            method: 'POST',
            body: JSON.stringify({ text })
        });

        input.value = '';
        await loadRequests();
    } catch (error) {
        alert('Failed to add request. Please try again.');
        console.error('Add request failed:', error);
    }
}

async function loadRequests() {
    try {
        requests = await apiCall('/requests');
        displayRequests();
    } catch (error) {
        console.error('Load requests failed:', error);
    }
}

function displayRequests() {
    const container = document.getElementById('requestsList');
    container.innerHTML = '';

    requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = `request-item ${request.completed ? 'completed' : ''}`;
        requestDiv.innerHTML = `
            <div class="request-content">
                <div class="request-text">${request.text}</div>
                <div class="request-time">${new Date(request.created_at).toLocaleString()}</div>
            </div>
            <div class="request-actions">
                <button onclick="toggleRequest(${request.id})" class="delete-btn">
                    ${request.completed ? 'Undo' : 'Complete'}
                </button>
                <button onclick="deleteRequest(${request.id})" class="delete-btn">Delete</button>
            </div>
        `;
        container.appendChild(requestDiv);
    });
}

async function toggleRequest(id) {
    try {
        const request = requests.find(r => r.id === id);
        const newCompleted = !request.completed;

        await apiCall(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: newCompleted })
        });

        await loadRequests();
    } catch (error) {
        alert('Failed to update request. Please try again.');
        console.error('Toggle request failed:', error);
    }
}

async function deleteRequest(id) {
    try {
        await apiCall(`/requests/${id}`, { method: 'DELETE' });
        await loadRequests();
    } catch (error) {
        alert('Failed to delete request. Please try again.');
        console.error('Delete request failed:', error);
    }
}

// Feelings functionality
let selectedFeeling = null;

function selectFeeling(feeling) {
    selectedFeeling = feeling;

    // Update visual selection
    document.querySelectorAll('.feeling-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.feeling-option').classList.add('selected');
}

async function saveFeelings() {
    if (!selectedFeeling) {
        alert('Please select how you\'re feeling! 💖');
        return;
    }

    const note = document.getElementById('feelingNote').value.trim();
    const today = new Date().toDateString();

    try {
        await apiCall('/feelings', {
            method: 'POST',
            body: JSON.stringify({
                date: today,
                feeling: selectedFeeling,
                note: note
            })
        });

        document.getElementById('feelingNote').value = '';
        await loadTodaysFeelings();

        // Reset selection
        selectedFeeling = null;
        document.querySelectorAll('.feeling-option').forEach(option => {
            option.classList.remove('selected');
        });
    } catch (error) {
        alert('Failed to save feelings. Please try again.');
        console.error('Save feelings failed:', error);
    }
}

async function loadTodaysFeelings() {
    try {
        const today = new Date().toDateString();
        const todaysFeelings = await apiCall(`/feelings/${today}`);
        const container = document.getElementById('currentFeeling');

        if (todaysFeelings) {
            const feelingEmojis = {
                happy: '😊',
                love: '🥰',
                excited: '🤩',
                calm: '😌',
                playful: '😘',
                tired: '😴'
            };

            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 1.5em;">${feelingEmojis[todaysFeelings.feeling]}</span>
                    <strong>Today I'm feeling ${todaysFeelings.feeling}</strong>
                </div>
                ${todaysFeelings.note ? `<div style="margin-bottom: 10px;">"${todaysFeelings.note}"</div>` : ''}
                <div style="font-size: 12px; color: #999;">Saved at ${new Date(todaysFeelings.created_at).toLocaleString()}</div>
            `;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    } catch (error) {
        console.error('Load feelings failed:', error);
    }
}

// Calendar functionality
async function loadAvailabilityData() {
    try {
        const availabilityList = await apiCall('/availability');
        availability = {};
        availabilityList.forEach(item => {
            availability[item.date] = item;
        });
    } catch (error) {
        console.error('Load availability failed:', error);
    }
}

function initializeCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('currentMonth');

    // Clear grid
    grid.innerHTML = '';

    // Set month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthDisplay.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    const today = new Date();
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = currentDate.getDate();

        const dateKey = currentDate.toDateString();

        // Add classes
        if (currentDate.getMonth() !== currentCalendarDate.getMonth()) {
            dayElement.classList.add('other-month');
        }

        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Check availability status
        if (availability[dateKey]) {
            dayElement.classList.add(availability[dateKey].status || 'available');
        }

        // Add click handler
        dayElement.addEventListener('click', () => selectDate(currentDate));

        grid.appendChild(dayElement);
    }
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(date) {
    selectedDate = date;

    // Update visual selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    event.target.classList.add('selected');

    // Show day details
    const dayDetails = document.getElementById('dayDetails');
    const selectedDateDisplay = document.getElementById('selectedDate');
    const dayNotes = document.getElementById('dayNotes');

    const dateKey = date.toDateString();
    const dayData = availability[dateKey];

    selectedDateDisplay.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    dayNotes.value = dayData ? (dayData.notes || '') : '';

    // Highlight current status button
    document.querySelectorAll('.availability-btn').forEach(btn => {
        btn.style.opacity = '0.6';
    });

    if (dayData && dayData.status) {
        const activeBtn = document.querySelector(`.availability-btn.${dayData.status}`);
        if (activeBtn) {
            activeBtn.style.opacity = '1';
        }
    } else {
        const clearBtn = document.querySelector('.availability-btn.clear');
        if (clearBtn) {
            clearBtn.style.opacity = '1';
        }
    }

    dayDetails.style.display = 'block';
}

function setAvailability(status) {
    if (!selectedDate) return;

    // Update button states
    document.querySelectorAll('.availability-btn').forEach(btn => {
        btn.style.opacity = '0.6';
    });

    if (status) {
        const activeBtn = document.querySelector(`.availability-btn.${status}`);
        if (activeBtn) {
            activeBtn.style.opacity = '1';
        }
    } else {
        const clearBtn = document.querySelector('.availability-btn.clear');
        if (clearBtn) {
            clearBtn.style.opacity = '1';
        }
    }
}

async function saveDayInfo() {
    if (!selectedDate) return;

    const dateKey = selectedDate.toDateString();
    const notes = document.getElementById('dayNotes').value.trim();

    // Get selected status
    let selectedStatus = '';
    document.querySelectorAll('.availability-btn').forEach(btn => {
        if (btn.style.opacity === '1') {
            selectedStatus = btn.classList.contains('available') ? 'available' :
                           btn.classList.contains('busy') ? 'busy' :
                           btn.classList.contains('maybe') ? 'maybe' : '';
        }
    });

    try {
        await apiCall('/availability', {
            method: 'POST',
            body: JSON.stringify({
                date: dateKey,
                status: selectedStatus,
                notes: notes
            })
        });

        await loadAvailabilityData();
        renderCalendar();

        // Re-select the date to update display
        setTimeout(() => {
            const dayElements = document.querySelectorAll('.calendar-day');
            dayElements.forEach(day => {
                if (day.textContent == selectedDate.getDate() && !day.classList.contains('other-month')) {
                    day.classList.add('selected');
                }
            });
        }, 100);
    } catch (error) {
        alert('Failed to save availability. Please try again.');
        console.error('Save availability failed:', error);
    }
}

// Bucket list functionality
async function addBucketItem() {
    const input = document.getElementById('bucketInput');
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter something for our bucket list! 🌟');
        return;
    }

    try {
        await apiCall('/bucket-list', {
            method: 'POST',
            body: JSON.stringify({ text })
        });

        input.value = '';
        await loadBucketList();
    } catch (error) {
        alert('Failed to add bucket list item. Please try again.');
        console.error('Add bucket item failed:', error);
    }
}

async function loadBucketList() {
    try {
        bucketList = await apiCall('/bucket-list');
        displayBucketList();
    } catch (error) {
        console.error('Load bucket list failed:', error);
    }
}

function displayBucketList() {
    const container = document.getElementById('bucketList');
    container.innerHTML = '';

    bucketList.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `bucket-item ${item.completed ? 'completed' : ''}`;
        itemDiv.innerHTML = `
            <div class="bucket-content">
                <div class="bucket-text">${item.text}</div>
                <div class="bucket-date">Added ${new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            <div class="bucket-actions">
                <button onclick="toggleBucketItem(${item.id})" class="delete-btn">
                    ${item.completed ? 'Undo' : 'Complete'}
                </button>
                <button onclick="deleteBucketItem(${item.id})" class="delete-btn">Delete</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

async function toggleBucketItem(id) {
    try {
        const item = bucketList.find(i => i.id === id);
        const newCompleted = !item.completed;

        await apiCall(`/bucket-list/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: newCompleted })
        });

        await loadBucketList();
    } catch (error) {
        alert('Failed to update bucket list item. Please try again.');
        console.error('Toggle bucket item failed:', error);
    }
}

async function deleteBucketItem(id) {
    try {
        await apiCall(`/bucket-list/${id}`, { method: 'DELETE' });
        await loadBucketList();
    } catch (error) {
        alert('Failed to delete bucket list item. Please try again.');
        console.error('Delete bucket item failed:', error);
    }
}

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Request input
    const requestInput = document.getElementById('requestInput');
    if (requestInput) {
        requestInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addRequest();
            }
        });
    }

    // Bucket input
    const bucketInput = document.getElementById('bucketInput');
    if (bucketInput) {
        bucketInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addBucketItem();
            }
        });
    }
});