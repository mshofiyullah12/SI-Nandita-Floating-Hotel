import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets and Drive scopes
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check if we already have a token stored in-memory or session
  const storedToken = sessionStorage.getItem("g_sheets_token");
  if (storedToken) {
    cachedAccessToken = storedToken;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // We have a user but no cached token (e.g. refreshed page)
        // Set needsAuth to true so they can sign in again to get a fresh token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem("g_sheets_token");
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Firebase Auth");
    }

    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem("g_sheets_token", cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || sessionStorage.getItem("g_sheets_token");
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem("g_sheets_token");
};

/**
 * Google Sheets & Drive API Helpers
 */

// Create a new spreadsheet
export const createSpreadsheet = async (accessToken: string, title: string): Promise<any> => {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gagal membuat spreadsheet");
  }

  return await response.json();
};

// Write/update values in a sheet range
export const updateSheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: values,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gagal memperbarui sheet");
  }

  return await response.json();
};

// Ensure sheet tab exists, or add it
export const ensureSheetTabExists = async (
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string
): Promise<void> => {
  // First, fetch spreadsheet metadata to check existing sheets
  const getResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    throw new Error("Gagal mengambil metadata spreadsheet");
  }

  const meta = await getResponse.json();
  const sheets = meta.sheets || [];
  const exists = sheets.some((s: any) => s.properties?.title === tabTitle);

  if (!exists) {
    // Call batchUpdate to add sheet
    const addResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: tabTitle,
              },
            },
          },
        ],
      }),
    });

    if (!addResponse.ok) {
      const err = await addResponse.json();
      throw new Error(err.error?.message || `Gagal membuat tab ${tabTitle}`);
    }
  }
};

// Fetch user's spreadsheets from Google Drive
export const fetchUserSpreadsheets = async (accessToken: string): Promise<any[]> => {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&orderBy=modifiedTime desc&pageSize=20",
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gagal mengambil daftar spreadsheet");
  }

  const data = await response.json();
  return data.files || [];
};

// Fetch sheet cell values for a given range (e.g. "'Data Siswa'!A1:K1000")
export const getSheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][] | null> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null; // tab or sheet might not exist yet
    const err = await response.json();
    throw new Error(err.error?.message || `Gagal mengambil data dari range ${range}`);
  }

  const data = await response.json();
  return data.values || null;
};
