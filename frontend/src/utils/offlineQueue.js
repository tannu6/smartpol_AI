/**
 * Offline Sync Queue using IndexedDB & Axios Interception for SmartPol AI.
 */
const DB_NAME = 'SmartPolOfflineDB'
const DB_VERSION = 1
const STORE_NAME = 'pendingActions'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function enqueueOfflineAction(action) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const item = {
      ...action,
      timestamp: Date.now(),
      status: 'pending'
    }
    const req = store.add(item)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getPendingOfflineActions() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function removeOfflineAction(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function clearOfflineQueue() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function replayOfflineQueue(apiClient) {
  const actions = await getPendingOfflineActions()
  if (actions.length === 0) return { success: 0, failed: 0 }

  let successCount = 0
  let failedCount = 0

  for (const action of actions) {
    try {
      if (action.type === 'HTTP_REQUEST') {
        await apiClient({
          method: action.method,
          url: action.url,
          data: action.data,
          headers: action.headers
        })
      }
      await removeOfflineAction(action.id)
      successCount++
    } catch (err) {
      console.error('Replay failed for offline action:', action, err)
      // If server returned 400 (duplicate/validation) or 401/403, remove to avoid loop
      if (err.response && [400, 401, 403, 409].includes(err.response.status)) {
        await removeOfflineAction(action.id)
      }
      failedCount++
    }
  }

  return { success: successCount, failed: failedCount }
}
