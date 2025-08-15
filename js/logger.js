// js/logger.js
const STORAGE_KEY = 'siteLogs';

function _getLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function _saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function logEvent(type, message) {
    const logs = _getLogs();
    const timestamp = new Date().toISOString();
    const page = window.location.pathname;
    logs.push({ time: timestamp, page, type, message });
    _saveLogs(logs);
}

// Shortcut helpers
function logClick(targetDescription) {
    logEvent('click', `Clicked on: ${targetDescription}`);
}

function logPageChange(toPage) {
    logEvent('pageChange', `Navigated to: ${toPage}`);
}

function logError(error) {
    logEvent('error', error.toString());
}

function logInit() {
    logEvent('init', 'Web app initialized');
}

function getLogs() {
    return _getLogs();
}

function clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
}

// Auto log errors
window.addEventListener('error', (event) => logError(event.error || event.message));

// Auto init
logInit();

export { logEvent, logClick, logPageChange, logError, logInit, getLogs, clearLogs };
