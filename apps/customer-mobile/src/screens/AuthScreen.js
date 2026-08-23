import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi } from '../services/api';

export const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('customer123');
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier || !password) {
      Alert.alert('Required Fields', 'Please enter your email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await customerApi.login(identifier, password);
        onLoginSuccess(res.user || { name: 'Rahul Sharma', email: identifier });
      } else {
        await customerApi.register({
          full_name: fullName,
          email: identifier,
          phone: phone,
          password: password,
          role: 'customer'
        });
        const loginRes = await customerApi.login(identifier, password);
        onLoginSuccess(loginRes.user || { name: fullName, email: identifier });
      }
    } catch (e) {
      Alert.alert('Authentication Error', e.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Ionicons name="water" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>AquaGo Wash</Text>
        </View>

        <Text style={styles.title}>{isLogin ? 'Customer Login' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Book doorstep car & bike washing in Mysuru' : 'Join thousands of satisfied vehicle owners'}
        </Text>

        {!isLogin && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </>
        )}

        <Text style={styles.label}>Email or Phone</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="rahul.sharma@example.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        {/* Quick Demo Fill Buttons */}
        <TouchableOpacity
          style={styles.demoFillBtn}
          onPress={() => {
            setIdentifier('rahul.sharma@example.com');
            setPassword('customer123');
          }}
        >
          <Text style={styles.demoFillText}>Fill Demo Credentials (Rahul Sharma)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10213F',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    gap: 10
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1264F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10213F'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#10213F'
  },
  submitBtn: {
    backgroundColor: '#1264F5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900'
  },
  demoFillBtn: {
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4
  },
  demoFillText: {
    color: '#1264F5',
    fontSize: 11,
    fontWeight: '800'
  },
  toggleBtn: {
    alignItems: 'center',
    marginTop: 8
  },
  toggleText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700'
  }
});
