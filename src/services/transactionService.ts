import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction } from '../types/finance';
import { SAMPLE_TRANSACTIONS, STORAGE_KEY } from '../data/sampleTransactions';

const COLLECTION_NAME = 'transactions';
const CLEARED_FLAG_KEY = 'ledgerstack_explicitly_cleared';

/**
 * Listen to realtime updates from Firestore.
 * Automatically seeds sample data on first run if database is empty and hasn't been explicitly cleared.
 */
export function subscribeToTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // If empty and user never clicked "Clear All Data", seed with sample data
        const wasCleared = window.localStorage.getItem(CLEARED_FLAG_KEY) === 'true';
        if (!wasCleared) {
          try {
            await seedSampleTransactions();
            return;
          } catch (err) {
            console.warn('Could not seed initial sample data to Firestore:', err);
          }
        }
        onUpdate([]);
        return;
      }

      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (
          data &&
          (data.type === 'income' || data.type === 'expense') &&
          typeof data.title === 'string' &&
          typeof data.amount === 'number' &&
          typeof data.date === 'string'
        ) {
          list.push({
            id: d.id,
            type: data.type,
            title: data.title,
            category: data.category,
            amount: data.amount,
            date: data.date,
          });
        }
      });

      // Sort by date descending
      list.sort((a, b) => b.date.localeCompare(a.date));

      // Backup to localStorage for instant offline access
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        // Ignore quota errors
      }

      onUpdate(list);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new transaction to Firestore.
 */
export async function addTransactionToFirestore(
  newTx: Omit<Transaction, 'id'>
): Promise<string> {
  window.localStorage.removeItem(CLEARED_FLAG_KEY);
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, newTx);
  return docRef.id;
}

/**
 * Update an existing transaction in Firestore.
 */
export async function updateTransactionInFirestore(
  tx: Transaction
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tx.id);
  const { id: _, ...data } = tx;
  await setDoc(docRef, data, { merge: true });
}

/**
 * Delete a transaction from Firestore.
 */
export async function deleteTransactionFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Restore transactions (for Undo action).
 */
export async function restoreTransactionsToFirestore(
  items: Transaction[]
): Promise<void> {
  window.localStorage.removeItem(CLEARED_FLAG_KEY);
  const batch = writeBatch(db);
  for (const item of items) {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    const { id: _, ...data } = item;
    batch.set(docRef, data);
  }
  await batch.commit();
}

/**
 * Clear all transactions from Firestore.
 */
export async function clearAllTransactionsInFirestore(
  existingIds: string[]
): Promise<void> {
  window.localStorage.setItem(CLEARED_FLAG_KEY, 'true');
  const batch = writeBatch(db);
  for (const id of existingIds) {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.delete(docRef);
  }
  await batch.commit();
}

/**
 * Reset Firestore database to initial sample data.
 */
export async function resetSampleDataInFirestore(
  existingIds: string[]
): Promise<void> {
  window.localStorage.removeItem(CLEARED_FLAG_KEY);
  const batch = writeBatch(db);

  // Remove existing records
  for (const id of existingIds) {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.delete(docRef);
  }

  // Insert default samples
  for (const sample of SAMPLE_TRANSACTIONS) {
    const docRef = doc(db, COLLECTION_NAME, sample.id);
    const { id: _, ...data } = sample;
    batch.set(docRef, data);
  }

  await batch.commit();
}

/**
 * Seed initial sample transactions when Firestore is blank.
 */
export async function seedSampleTransactions(): Promise<void> {
  const batch = writeBatch(db);
  for (const sample of SAMPLE_TRANSACTIONS) {
    const docRef = doc(db, COLLECTION_NAME, sample.id);
    const { id: _, ...data } = sample;
    batch.set(docRef, data);
  }
  await batch.commit();
}
