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
import { customerApi } from '../services/api';

export const MyBookingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('active'); // active | upcoming | completed
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await customerApi.getBookings();
      setBookings(data);
    } catch (e) {
      console.warn('MyBookings fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || '').toLowerCase();
    if (activeTab === 'active') {
      return ['assigned', 'accepted', 'on the way', 'arrived', 'in progress', 'pending verification', 'verified'].includes(status);
    } else if (activeTab === 'upcoming') {
      return ['pending verification', 'verified', 'assigned'].includes(status);
    } else if (activeTab === 'completed') {
      return ['completed', 'customer reviewed'].includes(status);
    }
    return true;
  });

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('completed') || s.includes('reviewed')) return '#16A34A';
    if (s.includes('on the way') || s.includes('arrived') || s.includes('in progress')) return '#1264F5';
    if (s.includes('pending')) return '#F59E0B';
    if (s.includes('rejected') || s.includes('cancelled')) return '#DC2626';
    return '#475569';
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'active', label: 'Active Jobs' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1264F5" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => (item.id || item.bookingNumber).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} />
          }
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            const isEnRoute = ['on the way', 'arrived', 'in progress'].includes((item.status || '').toLowerCase());
            return (
              <View style={styles.card}>
                {/* Header: ID & Status */}
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingId}>
                    #{item.bookingNumber || item.id}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}40` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status || 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Service & Vehicle Details */}
                <Text style={styles.serviceName}>{item.service?.name || 'Doorstep Wash'}</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="car-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>
                    {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Vehicle'} ({item.vehicle?.regNumber || 'KA-09-MA-7821'})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText}>
                    {item.date} • {item.timeSlot}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.address ? `${item.address.area}, ${item.address.city}` : 'Mysuru'}
                  </Text>
                </View>

                {/* Technician Info (if assigned) */}
                {item.employee && (
                  <View style={styles.techRow}>
                    <Ionicons name="person-circle-outline" size={18} color="#1264F5" />
                    <Text style={styles.techText}>
                      Specialist: <Text style={{ fontWeight: '800', color: '#10213F' }}>{item.employee.name}</Text>
                    </Text>
                  </View>
                )}

                {/* Footer: Price & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amount}>₹{item.finalAmount}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    {isEnRoute && (
                      <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => navigation.navigate('LiveTracking', { bookingId: item.id })}
                      >
                        <Ionicons name="navigate" size={14} color="#FFFFFF" />
                        <Text style={styles.trackBtnText}>Track</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                    >
                      <Text style={styles.detailsBtnText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={14} color="#1264F5" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
              <Text style={styles.emptySub}>Book a doorstep wash to get started.</Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => navigation.navigate('Services')}
              >
                <Text style={styles.emptyCtaText}>Browse Services</Text>
              </TouchableOpacity>
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
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 6
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBtnActive: {
    backgroundColor: '#1264F5'
  },
  tabBtnText: {
    fontSize: 12,
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  bookingId: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginTop: 4
  },
  techText: {
    fontSize: 11,
    color: '#1264F5',
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
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8
  },
  trackBtn: {
    backgroundColor: '#1264F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  detailsBtn: {
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  detailsBtnText: {
    color: '#1264F5',
    fontSize: 11,
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
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10213F'
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B'
  },
  emptyCta: {
    marginTop: 8,
    backgroundColor: '#1264F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  }
});
