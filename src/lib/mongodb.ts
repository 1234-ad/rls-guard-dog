import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB_NAME!

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

// MongoDB collections for additional data storage
export const COLLECTIONS = {
  ANALYTICS: 'analytics',
  LOGS: 'logs',
  CACHE: 'cache',
  NOTIFICATIONS: 'notifications'
} as const

// Helper functions for common MongoDB operations
export async function insertDocument(collection: string, document: any) {
  const db = await getMongoDb()
  return await db.collection(collection).insertOne({
    ...document,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

export async function findDocuments(collection: string, filter: any = {}, options: any = {}) {
  const db = await getMongoDb()
  return await db.collection(collection).find(filter, options).toArray()
}

export async function updateDocument(collection: string, filter: any, update: any) {
  const db = await getMongoDb()
  return await db.collection(collection).updateOne(filter, {
    $set: {
      ...update,
      updatedAt: new Date()
    }
  })
}

export async function deleteDocument(collection: string, filter: any) {
  const db = await getMongoDb()
  return await db.collection(collection).deleteOne(filter)
}

export default clientPromise