import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { workerApi } from '../services/api';

export const WorkerDashboardScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await workerApi.getJobs();
      setJobs(data);
    } catch (e) {
      console.warn('Worker dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const unsubscribe = navigation.addListener('focus', fetchDashboard);
    return unsubscribe;
  }, [navigation]);

  // Metrics
  const activeJob = jobs.find(j => ['assigned', 'accepted', 'on the way', 'arrived', 'in progress'].includes((j.status || '').toLowerCase()));
  const todayJobsCount = jobs.length;
  const activeCount = jobs.filter(j => ['on the way', 'arrived', 'in progress'].includes((j.status || '').toLowerCase())).length;
  const upcomingCount = jobs.filter(j => ['assigned', 'accepted'].includes((j.status || '').toLowerCase())).length;
  const completedCount = jobs.filter(j => ['completed', 'customer reviewed'].includes((j.status || '').toLowerCase())).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} />}
    >
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingTag}>SPECIALIST ON DUTY</Text>
            <Text style={styles.workerName}>Venkatesh Kumar 👨‍🔧</Text>
            <Text style={styles.subText}>Van #04 • Mysuru Central Hub</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[styles.availDot, { backgroundColor: isAvailable ? '#22C55E' : '#94A3B8' }]} />
            <Text style={styles.availLabel}>
              Status: <Text style={{ fontWeight: '900', color: isAvailable ? '#16A34A' : '#64748B' }}>
                {isAvailable ? 'Available for Bookings' : 'On Break'}
              </Text>
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
            thumbColor={isAvailable ? '#1264F5' : '#94A3B8'}
          />
        </View>
      </View>

      {/* KPI Metric Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Today's Jobs</Text>
          <Text style={styles.kpiValue}>{todayJobsCount}</Text>
          <Text style={styles.kpiSub}>Dispatched</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#BFDBFE', backgroundColor: '#F0F6FF' }]}>
          <Text style={[styles.kpiLabel, { color: '#1264F5' }]}>Active</Text>
          <Text style={[styles.kpiValue, { color: '#1264F5' }]}>{activeCount}</Text>
          <Text style={styles.kpiSub}>En Route / Wash</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Upcoming</Text>
          <Text style={styles.kpiValue}>{upcomingCount}</Text>
          <Text style={styles.kpiSub}>Next Slots</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.kpiLabel, { color: '#16A34A' }]}>Completed</Text>
          <Text style={[styles.kpiValue, { color: '#16A34A' }]}>{completedCount}</Text>
          <Text style={styles.kpiSub}>Finished</Text>
        </View>
      </View>

      {/* Current Active Job Card (Highlighted) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Assignment</Text>
      </View>

      {activeJob ? (
        <View style={styles.activeJobCard}>
          <View style={styles.jobRefRow}>
            <View style={styles.livePulse} />
            <Text style={styles.jobStatusText}>{activeJob.status.toUpperCase()}</Text>
            <Text style={styles.jobId}>#{activeJob.bookingNumber || activeJob.id}</Text>
          </View>

          <Text style={styles.jobCustomerName}>{activeJob.customerName || 'Customer'}</Text>
          <Text style={styles.jobServiceTitle}>{activeJob.service?.name}</Text>
          
          <View style={styles.jobDetailRow}>
            <Ionicons name="car-outline" size={14} color="#64748B" />
            <Text style={styles.jobDetailText}>
              {activeJob.vehicle ? `${activeJob.vehicle.brand} ${activeJob.vehicle.model}` : 'Vehicle'} ({activeJob.vehicle?.regNumber || 'KA-09-MA-7821'})
            </Text>
          </View>

          <View style={styles.jobDetailRow}>
            <Ionicons name="location-outline" size={14} color="#EF4444" />
            <Text style={styles.jobDetailText} numberOfLines={1}>
              {activeJob.address ? `${activeJob.address.area}, ${activeJob.address.city}` : 'Mysuru'}
            </Text>
          </View>

          <View style={styles.jobDetailRow}>
            <Ionicons name="time-outline" size={14} color="#1264F5" />
            <Text style={styles.jobDetailText}>
              {activeJob.date} • {activeJob.timeSlot}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.openJobBtn}
            onPress={() => navigation.navigate('JobDetail', { jobId: activeJob.id })}
          >
            <Text style={styles.openJobBtnText}>Open Action Console</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noActiveCard}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#22C55E" />
          <Text style={styles.noActiveTitle}>No Active Jobs In Progress</Text>
          <Text style={styles.noActiveSub}>You're all caught up! Check upcoming queue below.</Text>
        </View>
      )}

      {/* Quick Navigation Button */}
      <TouchableOpacity
        style={styles.viewAllJobsBtn}
        onPress={() => navigation.navigate('Jobs')}
      >
        <Ionicons name="list" size={18} color="#1264F5" />
        <Text style={styles.viewAllJobsText}>View All Assigned Bookings ({jobs.length})</Text>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 12
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  greetingTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1264F5',
    letterSpacing: 0.5
  },
  workerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10213F',
    marginTop: 2
  },
  subText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309'
  },
  availRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  availLabel: {
    fontSize: 12,
    color: '#475569'
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    alignItems: 'center',
    gap: 2
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B'
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10213F',
    fontFamily: 'monospace'
  },
  kpiSub: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600'
  },
  sectionHeader: {
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10213F'
  },
  activeJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#1264F5',
    gap: 8,
    shadowColor: '#1264F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  jobRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E'
  },
  jobStatusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1264F5'
  },
  jobId: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 'auto'
  },
  jobCustomerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  jobServiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1264F5'
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  jobDetailText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  openJobBtn: {
    backgroundColor: '#1264F5',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  openJobBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  noActiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 6
  },
  noActiveTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10213F'
  },
  noActiveSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },
  viewAllJobsBtn: {
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  viewAllJobsText: {
    color: '#1264F5',
    fontSize: 13,
    fontWeight: '800'
  }
});
