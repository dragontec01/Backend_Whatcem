// MongoDB initialization script
// This file runs automatically when the MongoDB container starts for the first time

print('=== MongoDB Initialization Started ===');

// Switch to the application database
db = db.getSiblingDB('dtechcxdb');

// Create collections with validation (optional)
// Add your collection schemas here when needed

print('Database initialized: dtechcxdb');
print('=== MongoDB Initialization Completed ===');
