import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../cofig/firebase'; // Added missing storage import
import { User, AuthError } from '../../types/auth';
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<string>;
  error: AuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const parseAuthError = (error: any): AuthError => {
    return {
      code: error.code || 'unknown',
      message: error.message || 'An unknown error occurred',
    };
  };

  const clearError = () => {
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const validDomains = ['@vitapstudent.ac.in', '@vitap.ac.in'];
    return validDomains.some(domain => email.endsWith(domain));
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw { 
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed'
        };
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw { 
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed'
        };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const firstName = email.split('@')[0].split('.')[0];
      const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        displayName: displayName,
        createdAt: new Date(),
        route: ''
      });

    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      clearError();
      await signOut(auth);
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      setIsLoading(true);
      clearError();
      
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      await updateProfile(auth.currentUser, data);
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, data, { merge: true });
      
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setIsLoading(true);
      clearError();

      console.log("Starting profile image upload process");
      console.log("Image URI:", uri);

      // Check if URI is valid
      if (!uri || typeof uri !== 'string' || !uri.startsWith('file:')) {
        throw new Error(`Invalid image URI: ${uri}`);
      }

      console.log("Fetching image data");
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      console.log("Converting to blob");
      const blob = await response.blob();
      console.log("Blob size:", blob.size);
      
      if (blob.size === 0) {
        throw new Error("Image blob is empty");
      }
      
      console.log("Creating storage reference");
      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
      
      console.log("Uploading bytes");
      await uploadBytes(storageRef, blob);
      
      console.log("Getting download URL");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);
      
      console.log("Updating user profile");
      await updateUserProfile({ photoURL: downloadURL });
      
      return downloadURL;
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      const parsedError = parseAuthError(error);
      setError(parsedError);
      throw parsedError;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    uploadProfileImage,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};