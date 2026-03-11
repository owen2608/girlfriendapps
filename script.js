// Data storage
let requests = JSON.parse(localStorage.getItem('requests')) || [];
let bucketList = JSON.parse(localStorage.getItem('bucketList')) || [];
let dailyFeelings = JSON.parse(localStorage.getItem('dailyFeelings')) || {};
let availability = JSON.parse(localStorage.getItem('availability')) || {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    loadRequests();
    loadBucketList();
    loadTodaysFeelings();
    loadTodaysAvailability();
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

// Availability functionality
function saveAvailability() {
    const morning = document.getElementById('morningFree').checked;
    const afternoon = document.getElementById('afternoonFree').checked;
    const evening = document.getElementById('eveningFree').checked;
    const notes = document.getElementById('scheduleNotes').value.trim();

    const today = new Date().toDateString();

    availability[today] = {
        morning: morning,
        afternoon: afternoon,
        evening: evening,
        notes: notes,
        timestamp: new Date().toLocaleString()
    };

    localStorage.setItem('availability', JSON.stringify(availability));
    alert('Availability saved! 📅✨');
}

function loadTodaysAvailability() {
    const today = new Date().toDateString();
    const todaysAvailability = availability[today];

    if (todaysAvailability) {
        document.getElementById('morningFree').checked = todaysAvailability.morning;
        document.getElementById('afternoonFree').checked = todaysAvailability.afternoon;
        document.getElementById('eveningFree').checked = todaysAvailability.evening;
        document.getElementById('scheduleNotes').value = todaysAvailability.notes || '';
    }
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

// Add some cute interactions
document.addEventListener('click', function(e) {
    // Add sparkle effect to cute images
    if (e.target.classList.contains('cute-image')) {
        e.target.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }
});

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