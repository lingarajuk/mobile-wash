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
import { workerApi } from '../services/api';

export const WorkerAuthScreen = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('venky@aquago.com');
  const [password, setPassword] = useState('employee123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Required Fields', 'Please enter your technician email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await workerApi.login(identifier, password);
      onLoginSuccess(res.user || { name: 'Venkatesh Kumar', email: identifier });
    } catch (e) {
      Alert.alert('Authentication Error', e.message || 'Invalid technician credentials.');
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
            <Ionicons name="construct" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>AquaGo Worker</Text>
        </View>

        <Text style={styles.title}>Technician Login</Text>
        <Text style={styles.subtitle}>Mobile van dispatch and assigned work console</Text>

        <Text style={styles.label}>Employee Email or ID</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="venky@aquago.com"
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
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In to Worker Console</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoFillBtn}
          onPress={() => {
            setIdentifier('venky@aquago.com');
            setPassword('employee123');
          }}
        >
          <Text style={styles.demoFillText}>Fill Demo Credentials (Venkatesh Kumar)</Text>
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
    gap: 12
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
  }
});
