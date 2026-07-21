import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, getDocFromCache } from "firebase/firestore";
import { app, auth } from "./googleAuth";

// Enable offline persistence in Firestore
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function isOfflineError(error: any): boolean {
  const errMsg = error instanceof Error ? error.message : String(error);
  return (
    !navigator.onLine ||
    errMsg.toLowerCase().includes("offline") ||
    errMsg.toLowerCase().includes("failed to get document") ||
    errMsg.toLowerCase().includes("unavailable") ||
    errMsg.toLowerCase().includes("network-error") ||
    (error && error.code === "unavailable")
  );
}

// Function to save all LPK data to Firestore
export async function saveLPKDataToFirestore(data: any): Promise<void> {
  const path = "lpk_data/main";
  try {
    await setDoc(doc(db, "lpk_data", "main"), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Client offline, save LPK data write queued in local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Function to load LPK data from Firestore
export async function loadLPKDataFromFirestore(): Promise<any | null> {
  const path = "lpk_data/main";
  const docRef = doc(db, "lpk_data", "main");
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Client offline, attempting to load LPK data from Firestore cache...");
      try {
        const cacheSnap = await getDocFromCache(docRef);
        if (cacheSnap.exists()) {
          console.log("Successfully loaded LPK data from Firestore offline cache.");
          return cacheSnap.data();
        }
      } catch (cacheError) {
        console.warn("LPK data document not found in offline Firestore cache.", cacheError);
      }
      return null; // Return null gracefully to fall back to LocalStorage
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Function to save user session (active sheet) to Firestore
export async function saveUserSessionToFirestore(username: string, activeSheet: string): Promise<void> {
  const normalizedUsername = username.toLowerCase().trim();
  const path = `sessions/${normalizedUsername}`;
  try {
    await setDoc(doc(db, "sessions", normalizedUsername), {
      username: normalizedUsername,
      activeSheet,
      lastActive: new Date().toISOString()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Client offline, save user session write queued in local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Function to load user session (active sheet) from Firestore
export async function loadUserSessionFromFirestore(username: string): Promise<any | null> {
  const normalizedUsername = username.toLowerCase().trim();
  const path = `sessions/${normalizedUsername}`;
  const docRef = doc(db, "sessions", normalizedUsername);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`Client offline, attempting to load session for ${normalizedUsername} from Firestore cache...`);
      try {
        const cacheSnap = await getDocFromCache(docRef);
        if (cacheSnap.exists()) {
          console.log(`Successfully loaded session for ${normalizedUsername} from Firestore offline cache.`);
          return cacheSnap.data();
        }
      } catch (cacheError) {
        console.warn(`Session for ${normalizedUsername} not found in offline Firestore cache.`, cacheError);
      }
      return null; // Return null gracefully
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}
