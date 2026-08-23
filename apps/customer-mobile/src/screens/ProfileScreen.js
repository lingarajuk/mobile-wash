import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation, onLogout }) => {
  const customer = {
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    memberTier: 'AquaGo Premium Club',
    walletBalance: '₹450',
    referralCode: 'AGWRAHUL50',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of AquaGo Wash?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <Image source={{ uri: customer.photo }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>{customer.phone}</Text>
          <Text style={styles.email}>{customer.email}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="sparkles" size={12} color="#1264F5" />
            <Text style={styles.tierText}>{customer.memberTier}</Text>
          </View>
        </View>
      </View>

      {/* Wallet & Referral Perks */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AquaGo Wallet</Text>
          <Text style={styles.statValue}>{customer.walletBalance}</Text>
          <Text style={styles.statSub}>Usable on any wash</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Refer & Earn</Text>
          <Text style={styles.statCode}>{customer.referralCode}</Text>
          <Text style={styles.statSub}>Share ₹100 reward</Text>
        </View>
      </View>

      {/* Account Menu Items */}
      <View style={styles.menuSection}>
        {[
          { icon: 'car-sport-outline', title: 'My Registered Vehicles', sub: '2 Vehicles added' },
          { icon: 'location-outline', title: 'Saved Doorstep Addresses', sub: 'Home, Office Mysuru' },
          { icon: 'card-outline', title: 'Payment Methods & UPI', sub: 'Default: UPI (Google Pay)' },
          { icon: 'gift-outline', title: 'Offers & Promo Codes', sub: 'WELCOME50 active' },
          { icon: 'help-circle-outline', title: 'Help & Customer Support', sub: '24/7 Doorstep Assistance' }
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon} size={20} color="#1264F5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out of AquaGo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#BFDBFE'
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  phone: {
    fontSize: 12,
    color: '#1264F5',
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 2
  },
  email: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1264F5'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 4
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16A34A'
  },
  statCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5'
  },
  statSub: {
    fontSize: 10,
    color: '#94A3B8'
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6ECF5'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10213F'
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800'
  }
});
