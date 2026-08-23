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

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await customerApi.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn('Notifs error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1264F5" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifs(); }} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="notifications" size={18} color="#1264F5" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.createdAt || 'Today'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>We'll notify you when technicians are assigned or en route.</Text>
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
  listContent: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10213F'
  },
  message: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 80,
    gap: 6
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10213F'
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});
