import React, { useState } from 'react';
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
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuth();

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

    return isValid;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }

      if (email.endsWith('@vitap.ac.in')) {
        router.replace('/Faculty');
      } else if (email.endsWith('@vitapstudent.ac.in')) {
        router.replace('/(tabs)');
      } else {
        router.replace('/');
      }

    } catch (err: any) {
      console.log('Auth error:', err);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setEmailError('');
    setPasswordError('');
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    const auth = getAuth();

    if (!forgotEmail || !validateEmail(forgotEmail)) {
      setForgotError('Enter a valid VIT-AP email');
      setForgotLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset email');
    }
    setForgotLoading(false);
  };

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
              placeholder="Email (@vitapstudent.ac.in or @vitap.ac.in)"
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
          )}

          {error && <Text style={styles.errorText}>{error.message}</Text>}

          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword} onPress={() => setShowForgotModal(true)}>
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

      {/* Forgot Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showForgotModal}
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your VIT-AP email"
              value={forgotEmail}
              onChangeText={(text) => {
                setForgotEmail(text);
                setForgotError('');
                setForgotSuccess('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {forgotError ? <Text style={styles.errorText}>{forgotError}</Text> : null}
            {forgotSuccess ? <Text style={{ color: 'green', marginTop: 5 }}>{forgotSuccess}</Text> : null}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.authButtonText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowForgotModal(false)}
              style={{ marginTop: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#3366FF' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  logoContainer: { alignItems: 'center', marginTop: 60, marginBottom: 24 },
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B' },
  formContainer: { paddingHorizontal: 24 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 4 },
  authButton: {
    backgroundColor: '#3366FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  forgotPassword: { alignItems: 'center', marginTop: 16 },
  forgotPasswordText: { color: '#3366FF', fontSize: 14 },
  toggleMode: { alignItems: 'center', marginTop: 20 },
  toggleModeText: { color: '#3366FF', fontSize: 14, fontWeight: '500' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default Login;
