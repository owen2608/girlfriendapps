// Data storage
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let bucketList = JSON.parse(localStorage.getItem('bucketList')) || [];
let dailyFeelings = JSON.parse(localStorage.getItem('dailyFeelings')) || {};
let availability = JSON.parse(localStorage.getItem('availability')) || {};

// Calendar variables
let currentCalendarDate = new Date();
let selectedDate = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    loadRequests();
    loadBucketList();
    loadTodaysFeelings();
    initializeCalendar();
});

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
function addRequest() {
    const input = document.getElementById('requestInput');
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter a request! 💕');
        return;
    }

    const request = {
        id: Date.now(),
        text: text,
        timestamp: new Date().toLocaleString(),
        completed: false
    };

    requests.unshift(request);
    localStorage.setItem('requests', JSON.stringify(requests));
    input.value = '';
    loadRequests();
}

function loadRequests() {
    const container = document.getElementById('requestsList');
    container.innerHTML = '';

    requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = `request-item ${request.completed ? 'completed' : ''}`;
        requestDiv.innerHTML = `
            <div class="request-content">
                <div class="request-text">${request.text}</div>
                <div class="request-time">${request.timestamp}</div>
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

function toggleRequest(id) {
    const request = requests.find(r => r.id === id);
    if (request) {
        request.completed = !request.completed;
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequests();
    }
}

function deleteRequest(id) {
    requests = requests.filter(r => r.id !== id);
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests();
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

function saveFeelings() {
    if (!selectedFeeling) {
        alert('Please select how you\'re feeling! 💖');
        return;
    }

    const note = document.getElementById('feelingNote').value.trim();
    const today = new Date().toDateString();

    dailyFeelings[today] = {
        feeling: selectedFeeling,
        note: note,
        timestamp: new Date().toLocaleString()
    };

    localStorage.setItem('dailyFeelings', JSON.stringify(dailyFeelings));
    document.getElementById('feelingNote').value = '';
    loadTodaysFeelings();

    // Reset selection
    selectedFeeling = null;
    document.querySelectorAll('.feeling-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function loadTodaysFeelings() {
    const today = new Date().toDateString();
    const todaysFeelings = dailyFeelings[today];
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
            <div style="font-size: 12px; color: #999;">Saved at ${todaysFeelings.timestamp}</div>
        `;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// Calendar functionality
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
    const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    const today = new Date();
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
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

function saveDayInfo() {
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

    if (selectedStatus || notes) {
        availability[dateKey] = {
            status: selectedStatus,
            notes: notes,
            timestamp: new Date().toLocaleString()
        };
    } else {
        delete availability[dateKey];
    }

    localStorage.setItem('availability', JSON.stringify(availability));
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
}

// Bucket list functionality
function addBucketItem() {
    const input = document.getElementById('bucketInput');
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter something for our bucket list! 🌟');
        return;
    }

    const item = {
        id: Date.now(),
        text: text,
        dateAdded: new Date().toLocaleDateString(),
        completed: false
    };

    bucketList.unshift(item);
    localStorage.setItem('bucketList', JSON.stringify(bucketList));
    input.value = '';
    loadBucketList();
}

function loadBucketList() {
    const container = document.getElementById('bucketList');
    container.innerHTML = '';

    bucketList.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `bucket-item ${item.completed ? 'completed' : ''}`;
        itemDiv.innerHTML = `
            <div class="bucket-content">
                <div class="bucket-text">${item.text}</div>
                <div class="bucket-date">Added ${item.dateAdded}</div>
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

function toggleBucketItem(id) {
    const item = bucketList.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        localStorage.setItem('bucketList', JSON.stringify(bucketList));
        loadBucketList();
    }
}

function deleteBucketItem(id) {
    bucketList = bucketList.filter(i => i.id !== id);
    localStorage.setItem('bucketList', JSON.stringify(bucketList));
    loadBucketList();
}


// Add enter key support for inputs
document.getElementById('requestInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addRequest();
    }
});

document.getElementById('bucketInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addBucketItem();
    }
});

// Add cute welcome message
setTimeout(function() {
    if (requests.length === 0 && bucketList.length === 0) {
        const today = new Date().toDateString();
        if (!dailyFeelings[today] && !availability[today]) {
            console.log('💖 Welcome to your special space! Start by sharing how you\'re feeling today! 💖');
        }
    }
}, 1000);