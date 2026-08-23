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

export const WorkerProfileScreen = ({ onLogout }) => {
  const worker = {
    name: 'Venkatesh Kumar',
    empId: 'EMP-201',
    phone: '+91 91234 56789',
    email: 'venky@aquago.com',
    role: 'Certified Detailing Specialist',
    rating: '4.9',
    experience: '4.5 Years',
    completedJobs: 18,
    skills: 'Exterior Foam Wash, Ceramic Polish, Interior Sanitization',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of AquaGo Worker console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: worker.photo }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.empBadge}>ID: {worker.empId}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{worker.rating}</Text>
            </View>
          </View>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.role}>{worker.role}</Text>
          <Text style={styles.phone}>📞 {worker.phone}</Text>
        </View>
      </View>

      {/* Experience & Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Certifications & Expertise</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoVal}>{worker.experience}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Washes:</Text>
          <Text style={styles.infoVal}>{worker.completedJobs} Completed</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.infoLabel}>Core Skills:</Text>
          <View style={styles.skillsWrap}>
            {worker.skills.split(', ').map((skill, i) => (
              <View key={i} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Equipment & Van */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assigned Mobile Van & Gear</Text>
        <View style={styles.vanRow}>
          <Ionicons name="bus" size={24} color="#1264F5" />
          <View style={{ flex: 1 }}>
            <Text style={styles.vanTitle}>Mobile Detailing Van #04</Text>
            <Text style={styles.vanSub}>Equipped with High-Pressure Jet, 300L Water Tank, Inverter & Foam Lance</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  empBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5',
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309'
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  role: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  phone: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1264F5',
    marginTop: 2
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10213F'
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  skillPill: {
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  skillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1264F5'
  },
  vanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4
  },
  vanTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10213F'
  },
  vanSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
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
