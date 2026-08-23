import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { workerApi } from '../services/api';

export const WorkerJobsScreen = ({ navigation }) => {
  const [filterTab, setFilterTab] = useState('all'); // all | assigned | active | completed
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await workerApi.getJobs();
      setJobs(data);
    } catch (e) {
      console.warn('Worker jobs fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const unsubscribe = navigation.addListener('focus', fetchJobs);
    return unsubscribe;
  }, [navigation]);

  const filtered = jobs.filter((j) => {
    const s = (j.status || '').toLowerCase();
    if (filterTab === 'assigned') return s === 'assigned' || s === 'accepted';
    if (filterTab === 'active') return s === 'on the way' || s === 'arrived' || s === 'in progress';
    if (filterTab === 'completed') return s === 'completed' || s === 'customer reviewed';
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('completed') || s.includes('reviewed')) return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' };
    if (s.includes('in progress')) return { bg: '#F0F6FF', border: '#BFDBFE', text: '#1264F5' };
    if (s.includes('on the way') || s.includes('arrived')) return { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' };
    if (s.includes('assigned')) return { bg: '#FAF5FF', border: '#E9D5FF', text: '#7E22CE' };
    return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' };
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'all', label: 'All Jobs' },
          { key: 'assigned', label: 'Assigned' },
          { key: 'active', label: 'In Progress' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => {
          const isSelected = filterTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setFilterTab(tab.key)}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jobs List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1264F5" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => (item.id || item.bookingNumber).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} />}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingId}>#{item.bookingNumber || item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
                <Text style={styles.serviceName}>{item.service?.name || 'Wash Package'}</Text>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={14} color="#1264F5" />
                  <Text style={styles.phoneText}>{item.customerPhone || '+91 98765 43210'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="car-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>
                    {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Vehicle'} ({item.vehicle?.regNumber || 'KA-09-MA-7821'})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>
                    {item.date} ({item.timeSlot})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#EF4444" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.address ? `${item.address.area}, ${item.address.city}` : 'Mysuru'}
                  </Text>
                </View>

                {/* Footer Action */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.collectLabel}>Amount Collectable</Text>
                    <Text style={styles.amount}>₹{item.finalAmount}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewJobBtn}
                    onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                  >
                    <Text style={styles.viewJobBtnText}>View Job Details</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No {filterTab} jobs found</Text>
              <Text style={styles.emptySub}>Assigned orders will appear here in real-time.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 10,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 6
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBtnActive: {
    backgroundColor: '#1264F5'
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  bookingId: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  customerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1264F5',
    marginBottom: 2
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1264F5',
    fontFamily: 'monospace'
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  collectLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  amount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F',
    fontFamily: 'monospace'
  },
  viewJobBtn: {
    backgroundColor: '#1264F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12
  },
  viewJobBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
    gap: 6
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10213F'
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B'
  }
});
