'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase/firebase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.error('Auth is not initialized');
      setLoading(false);
      toast.error('Er is een fout opgetreden bij het laden van de authenticatie');
      return;
    }

    console.log('Setting up auth state listener');
    
    try {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('Auth persistence set to local');
        })
        .catch((error) => {
          console.error('Error setting auth persistence:', error);
        });

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', {
          currentUser: user?.email,
          uid: user?.uid,
          providerId: user?.providerId,
          lastSignInTime: user?.metadata?.lastSignInTime
        });

        if (user) {
          if (!user.email?.endsWith('@growleo.com')) {
            console.log('Non-Growleo account detected, signing out');
            try {
              if (auth) {
                await firebaseSignOut(auth);
                toast.error('Alleen Growleo accounts zijn toegestaan');
                router.push('/login');
                return;
              }
            } catch (error) {
              console.error('Error signing out non-Growleo user:', error);
            }
          }
        }

        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error in auth state setup:', error);
      setLoading(false);
      toast.error('Er is een fout opgetreden bij het laden van de authenticatie');
    }
  }, [router]);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      console.error('Auth is not initialized');
      toast.error('Er is een fout opgetreden bij het inloggen');
      return;
    }

    try {
      if (!email.endsWith('@growleo.com')) {
        throw new Error('Alleen @growleo.com email adressen zijn toegestaan');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      toast.success('Succesvol ingelogd!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Alleen @growleo.com email adressen zijn toegestaan') {
        toast.error(error.message);
      } else {
        toast.error('Ongeldige inloggegevens');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in process');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user);
      
      // Get the access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        throw new Error('No credential received from Google');
      }
      
      const accessToken = credential.accessToken;
      console.log('Received access token');
      
      // Store the access token in Firestore
      if (result.user) {
        const clientRef = doc(db, 'clients', result.user.uid);
        await setDoc(clientRef, {
          email: result.user.email,
          name: result.user.displayName,
          accessToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true });
        console.log('Access token stored in Firestore');
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during Google sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      console.error('Auth is not initialized');
      return;
    }

    try {
      console.log('Starting sign out process');
      await firebaseSignOut(auth);
      router.push('/login');
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Er is een fout opgetreden bij het uitloggen');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 