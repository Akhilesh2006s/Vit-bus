import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();
import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthProvider';
import { auth } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { colors } from '../constants/colors';
import Constants from "expo-constants";

const routes = [
  { name: "VV1", city: "Vijayawada" },
  { name: "VV2", city: "Vijayawada" },
  { name: "VV3", city: "Vijayawada" },
  { name: "VV4", city: "Vijayawada" },
  { name: "VV5", city: "Vijayawada" },
  { name: "VV6", city: "Vijayawada" },
  { name: "GV1", city: "Guntur" },
  { name: "GV2", city: "Guntur" },
  { name: "GV3", city: "Guntur" },
  { name: "GV4", city: "Guntur" },
  { name: "GV5", city: "Guntur" },
  { name: "GV6", city: "Guntur" },
];

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://git-backend-1-production.up.railway.app';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, register, isLoading: authLoading, error, clearError, setUserInfo, setSelectedRouteId, user } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'http://1036966591471-gg5qhjuc132bpqflieubu5ms52trgtft.apps.googleusercontent.com',
    androidClientId: 'http://1036966591471-2a1ai61lra8mpihktm5irqb6ak668sa3.apps.googleusercontent.com',
    webClientId: 'http://1036966591471-eosv71b6i622hto2emvudsbfuvfld1c5.apps.googleusercontent.com',
  });

  const validateEmail = (email: string) => {
    const validDomains = ['@vitapstudent.ac.in', '@vitap.ac.in'];
    return validDomains.some(domain => email.endsWith(domain));
  };

  const validateForm = () => {
    let isValid = true;
    clearError();
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Only @vitapstudent.ac.in and @vitap.ac.in emails are allowed');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isLogin && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!isLogin && !selectedRoute && email.endsWith('@vitapstudent.ac.in')) {
      Alert.alert("Please select your bus route");
      isValid = false;
    }

    return isValid;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)');
      } else {
        await register(email, password);
        
        // Save route if student
        if (email.endsWith('@vitapstudent.ac.in')) {
          await setSelectedRouteId(selectedRoute);
          
          const token = await user?.getIdToken();
          const response = await fetch(`${API_BASE_URL}/api/user/route`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ route: selectedRoute }),
          });

          if (!response.ok) {
            throw new Error('Failed to save route to server');
          }
        }

        // Redirect based on email domain
        if (email.endsWith('@vitap.ac.in')) {
          router.replace('/Faculty');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      console.log('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setEmailError('');
    setPasswordError('');
    setSelectedRoute('');
  };
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then((userCredential) => {
        const user = userCredential.user;
        setUserInfo({
          photoURL: user.photoURL || '',
          displayName: user.displayName || '',
        });
        router.replace('/routes/selectRoute');
      });
    }
  }, [response]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/7470/bus-people-public-transport.jpg' }}
            style={styles.logo}
          />
          <Text style={styles.title}>VIT-AP Bus Tracker</Text>
          <Text style={styles.subtitle}>Track your bus in real-time</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{isLogin ? 'Login' : 'Create Account'}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Email (@vitapstudent.ac.in or @vitap.ac.in )"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {email.endsWith( 'vitapstudent.ac.in') && (
                <View style={styles.routeSelectionContainer}>
                  <Text style={styles.label}>Select Your Bus Route</Text>
                  <View style={styles.citySection}>
                    <Text style={styles.cityTitle}>📍 Vijayawada</Text>
                    <View style={styles.routeContainer}>
                      {routes.filter(route => route.city === "Vijayawada").map(route => (
                        <TouchableOpacity 
                          key={route.name} 
                          style={[
                            styles.routeButton,
                            selectedRoute === route.name && styles.selectedRouteButton
                          ]} 
                          onPress={() => setSelectedRoute(route.name)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.routeText}>{route.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.citySection}>
                    <Text style={styles.cityTitle}>📍 Guntur</Text>
                    <View style={styles.routeContainer}>
                      {routes.filter(route => route.city === "Guntur").map(route => (
                        <TouchableOpacity 
                          key={route.name} 
                          style={[
                            styles.routeButton,
                            selectedRoute === route.name && styles.selectedRouteButton
                          ]} 
                          onPress={() => setSelectedRoute(route.name)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.routeText}>{route.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {error && <Text style={styles.errorText}>{error.message}</Text>}

          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAuth}
            disabled={isLoading || authLoading}
          >
            {(isLoading || authLoading) ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.toggleMode} onPress={toggleAuthMode}>
            <Text style={styles.toggleModeText}>
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  authButton: {
    backgroundColor: '#3366FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#3366FF',
    fontSize: 14,
  },
  toggleMode: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleModeText: {
    color: '#3366FF',
    fontSize: 14,
    fontWeight: '500',
  },
  routeSelectionContainer: {
    marginTop: 16,
    width: '100%',
  },
  citySection: {
    width: '100%',
    backgroundColor: 'orange',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'darkbrown',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  routeButton: {
    width: '48%',
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedRouteButton: {
    backgroundColor: '#E2E8F0',
    borderColor: 'darkbrown',
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'darkbrown',
  },
});

export default Login;
