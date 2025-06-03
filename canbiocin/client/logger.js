// Create a custom logger that preserves line numbers
const logger = {
    log: function(...args) {
        const now = new Date();
        const timestamp = now.toISOString();
        console.log(timestamp, ...args);
    },
    error: function(...args) {
        const now = new Date();
        const timestamp = now.toISOString();
        console.error(timestamp, ...args);
    },
    warn: function(...args) {
        const now = new Date();
        const timestamp = now.toISOString();
        console.warn(timestamp, ...args);
    }
};

export default logger; 