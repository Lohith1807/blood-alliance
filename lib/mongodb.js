
import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URL) {
    try {
        process.loadEnvFile();
    } catch {
        // env file might not be present or already loaded
    }
}

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const options = {
    // Prevent the connection from hanging indefinitely
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    // Connection pool limits to prevent exhausting database resources
    maxPoolSize: 10,
    minPoolSize: 1,
};

if (!MONGO_URL) {
    throw new Error('Please define the MONGO_URL or MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(MONGO_URL, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGO_URL, options);
    clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
