/**
 * Digital Wedding Invitation - JavaScript
 * Features: Countdown Timer, Google Maps Integration, Guest Messages
 */

// Global Variables
let guestMessages = [];
let countdownInterval;

// Wedding date - Set to August 15, 2025 at 4:00 PM
const weddingDate = new Date();
weddingDate.setFullYear(2025, 7, 15); // Month is zero-based: 7 = August
weddingDate.setHours(20, 0, 0, 0);    // 8:00 PM (20:00 in 24-hour format)

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    setupNavigation();
    startCountdownTimer();
    setupMessageForm();
    setupScrollEffects();
    updateWeddingDateDisplay();
    
    console.log('Wedding Invitation App Initialized');
}

/**
 * Setup smooth scroll navigation
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active navigation state
                updateActiveNavigation(this);
            }
        });
    });
    
    // Update navigation on scroll
    window.addEventListener('scroll', throttle(updateNavigationOnScroll, 100));
}

/**
 * Update active navigation link
 */
function updateActiveNavigation(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

/**
 * Update navigation based on scroll position
 */
function updateNavigationOnScroll() {
    const sections = ['home', 'details', 'location', 'messages'];
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPosition = window.scrollY + 100;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`[href="#${sections[i]}"]`);
            if (activeLink) activeLink.classList.add('active');
            break;
        }
    }
}

/**
 * Start the countdown timer
 */
function startCountdownTimer() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Update countdown display
 */
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = weddingDate.getTime() - now;
    
    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Update DOM elements
        updateTimeDisplay('days', days);
        updateTimeDisplay('hours', hours);
        updateTimeDisplay('minutes', minutes);
        updateTimeDisplay('seconds', seconds);
    } else {
        // Wedding day has arrived
        displayWeddingDayMessage();
        clearInterval(countdownInterval);
    }
}

/**
 * Update individual time display element
 */
function updateTimeDisplay(unit, value) {
    const element = document.getElementById(unit);
    if (element) {
        const formattedValue = value.toString().padStart(2, '0');
        if (element.textContent !== formattedValue) {
            element.textContent = formattedValue;
            // Add animation class for smooth transition
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 300);
        }
    }
}

/**
 * Display wedding day message when countdown reaches zero
 */
function displayWeddingDayMessage() {
    const countdownContainer = document.querySelector('.countdown-container');
    if (countdownContainer) {
        countdownContainer.innerHTML = `
            <div class="wedding-day-message">
                <h3>🎉 Today is the Big Day! 🎉</h3>
                <p>Mohamed & Marwa are getting married today!</p>
            </div>
        `;
    }
}

/**
 * Update wedding date display in hero section
 */
function updateWeddingDateDisplay() {
    const dateElement = document.getElementById('wedding-date-display');
    if (dateElement) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = weddingDate.toLocaleDateString('en-US', options);
    }
}

/**
 * Setup message form functionality
 */
function setupMessageForm() {
    const messageForm = document.getElementById('message-form');
    const messagesList = document.getElementById('messages-list');
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleMessageSubmission();
        });
    }
    
    // Load any existing messages
    displayMessages();
}

/**
 * Handle message form submission
 */
function handleMessageSubmission() {
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    
    if (!nameInput || !messageInput) {
        showNotification('Form elements not found', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    // Validation
    if (!name || !message) {
        showNotification('Please fill in both your name and message', 'error');
        return;
    }
    
    if (name.length < 2) {
        showNotification('Name must be at least 2 characters long', 'error');
        return;
    }
    
    if (message.length < 10) {
        showNotification('Message must be at least 10 characters long', 'error');
        return;
    }
    
    if (message.length > 500) {
        showNotification('Message must be less than 500 characters', 'error');
        return;
    }
    
    // Create message object
    const newMessage = {
        id: Date.now(),
        name: sanitizeInput(name),
        message: sanitizeInput(message),
        timestamp: new Date()
    };
    
    // Add to messages array
    guestMessages.unshift(newMessage); // Add to beginning for latest first
    
    // Display messages
    displayMessages();
    
    // Clear form
    nameInput.value = '';
    messageInput.value = '';
    
    // Show success notification
    showNotification('Thank you for your beautiful message!', 'success');
    
    // Scroll to messages
    scrollToMessages();
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Display all guest messages
 */
function displayMessages() {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;
    
    if (guestMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="no-messages">
                <p>Be the first to leave a message for Mohamed & Marwa!</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = guestMessages.map(msg => `
        <div class="message-item" data-id="${msg.id}">
            <div class="message-header">
                <span class="message-author">${msg.name}</span>
                <span class="message-time">${formatMessageTime(msg.timestamp)}</span>
            </div>
            <p class="message-text">${msg.message}</p>
        </div>
    `).join('');
    
    messagesList.innerHTML = messagesHTML;
}

/**
 * Format message timestamp
 */
function formatMessageTime(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return messageTime.toLocaleDateString();
}

/**
 * Scroll to messages section
 */
function scrollToMessages() {
    const messagesSection = document.getElementById('messages');
    if (messagesSection) {
        const offsetTop = messagesSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * Setup scroll effects and animations
 */
function setupScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.event-item, .time-unit, .message-item');
    animateElements.forEach(el => observer.observe(el));
}

/**
 * Handle map interactions (no longer using Google Maps API)
 */
function initMap() {
    // Map is now handled by embedded iframe, no JavaScript needed
    console.log('Map is displayed using embedded Google Maps iframe');
}

/**
 * Utility function: Throttle
 */
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility function: Debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', debounce(function() {
    // Recalculate any layout-dependent elements
    if (window.google && window.google.maps) {
        // Trigger map resize if needed
        const mapElement = document.getElementById('map');
        if (mapElement) {
            google.maps.event.trigger(map, 'resize');
        }
    }
}, 250));

/**
 * Handle visibility change (tab switching)
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause animations if needed
        console.log('Page hidden');
    } else {
        // Page is visible, resume animations
        console.log('Page visible');
        // Ensure countdown is still running
        if (!countdownInterval) {
            startCountdownTimer();
        }
    }
});

/**
 * Cleanup function for page unload
 */
window.addEventListener('beforeunload', function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

// Add CSS for animations
const animationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .time-value.updated {
        animation: pulse 0.3s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 0.7;
        transition: opacity 0.2s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        updateCountdown,
        handleMessageSubmission,
        sanitizeInput,
        formatMessageTime
    };
}
