import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { workerApi } from '../services/api';

export const WorkerHistoryScreen = () => {
  const [historyJobs, setHistoryJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await workerApi.getJobs();
      const completed = data.filter(j => ['completed', 'customer reviewed'].includes((j.status || '').toLowerCase()));
      setHistoryJobs(completed);
    } catch (e) {
      console.warn('Worker history error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalEarnings = historyJobs.reduce((sum, j) => sum + (Number(j.finalAmount) || 0), 0);

  return (
    <View style={styles.container}>
      {/* Earnings Overview Card */}
      <View style={styles.earningsCard}>
        <View>
          <Text style={styles.earningsLabel}>Lifetime Earnings</Text>
          <Text style={styles.earningsValue}>₹{totalEarnings.toLocaleString()}</Text>
        </View>
        <View style={styles.jobsCountBadge}>
          <Ionicons name="checkmark-done-circle" size={16} color="#16A34A" />
          <Text style={styles.jobsCountText}>{historyJobs.length} Completed Washes</Text>
        </View>
      </View>

      {/* History List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1264F5" />
        </View>
      ) : (
        <FlatList
          data={historyJobs}
          keyExtractor={(item) => (item.id || item.bookingNumber).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.bookingId}>#{item.bookingNumber || item.id}</Text>
                <Text style={styles.completedBadge}>COMPLETED ✓</Text>
              </View>

              <Text style={styles.serviceTitle}>{item.service?.name || 'Wash Package'}</Text>
              <Text style={styles.customerText}>Customer: {item.customerName || 'Rahul Sharma'}</Text>
              <Text style={styles.dateText}>📅 {item.date} • {item.timeSlot}</Text>
              
              {item.review && (
                <View style={styles.reviewSnippet}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= (item.review.rating || 5) ? "star" : "star-outline"}
                        size={12}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>"{item.review.comment || item.review.feedback}"</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.payoutLabel}>Earned</Text>
                <Text style={styles.payoutAmount}>₹{item.finalAmount}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="ribbon-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No completed jobs yet</Text>
              <Text style={styles.emptySub}>Finish active doorstep washes to build your service history.</Text>
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
  earningsCard: {
    backgroundColor: '#10213F',
    margin: 16,
    marginBottom: 8,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  earningsLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700'
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#38BDF8',
    fontFamily: 'monospace',
    marginTop: 2
  },
  jobsCountBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  jobsCountText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 14,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bookingId: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5'
  },
  completedBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10213F'
  },
  customerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  dateText: {
    fontSize: 11,
    color: '#64748B'
  },
  reviewSnippet: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    gap: 4,
    marginTop: 4
  },
  reviewText: {
    fontSize: 11,
    color: '#B45309',
    fontStyle: 'italic'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  payoutLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
    fontFamily: 'monospace'
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
