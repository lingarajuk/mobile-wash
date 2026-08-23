import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi } from '../services/api';

export const LiveTrackingScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const data = await customerApi.getBookingById(bookingId);
      setBooking(data);
    } catch (e) {
      console.warn('Tracking fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 4000); // Polling real-time GPS
    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#1264F5" />
      </View>
    );
  }

  const emp = booking?.employee || {
    name: 'Venkatesh Kumar',
    phone: '+91 91234 56789',
    rating: '4.9',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  };

  const loc = booking?.liveLocation || {
    latitude: 12.3150,
    longitude: 76.6550,
    speed: 32,
    updatedAt: 'Just now'
  };

  const openGoogleMaps = () => {
    const lat = booking?.address?.latitude || 12.3118;
    const lng = booking?.address?.longitude || 76.6529;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Map Simulation Visual Banner */}
      <View style={styles.mapArea}>
        <View style={styles.mapPinDestination}>
          <Ionicons name="home" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.mapLabelDestination}>Doorstep 📍</Text>

        <View style={styles.mapPathLine} />

        <View style={styles.mapVanMarker}>
          <Ionicons name="car" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.mapLabelVan}>Specialist 🚗</Text>

        <TouchableOpacity style={styles.openExternalMapBtn} onPress={openGoogleMaps}>
          <Ionicons name="navigate" size={14} color="#1264F5" />
          <Text style={styles.openExternalMapText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Technician Live Card */}
      <View style={styles.bottomCard}>
        <View style={styles.liveStatusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveStatusText}>LIVE GPS DISPATCH TRACKING</Text>
          <Text style={styles.etaText}>ETA: ~12 Mins</Text>
        </View>

        <View style={styles.techInfoRow}>
          <Image source={{ uri: emp.photo }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.techName}>{emp.name}</Text>
            <Text style={styles.techDesignation}>Certified Detailing Specialist</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{emp.rating} • 100+ Doorstep Washes</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.callCircleBtn}
            onPress={() => Linking.openURL(`tel:${emp.phone}`)}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* GPS Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>2.4 km</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Van Speed</Text>
            <Text style={styles.metricValue}>{loc.speed || 30} km/h</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Vehicle</Text>
            <Text style={styles.metricValue}>Van #04</Text>
          </View>
        </View>

        {/* Booking Reference Footer */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Service: <Text style={{ fontWeight: '800', color: '#10213F' }}>{booking?.service?.name || 'Doorstep Wash'}</Text>
          </Text>
          <Text style={styles.footerNoteText}>Booking #{booking?.bookingNumber || booking?.id}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  mapPinDestination: {
    position: 'absolute',
    top: '30%',
    left: '65%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  mapLabelDestination: {
    position: 'absolute',
    top: '39%',
    left: '60%',
    fontSize: 11,
    fontWeight: '800',
    color: '#10213F',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  mapPathLine: {
    position: 'absolute',
    top: '40%',
    left: '35%',
    width: 120,
    height: 3,
    backgroundColor: '#1264F5',
    transform: [{ rotate: '-25deg' }]
  },
  mapVanMarker: {
    position: 'absolute',
    top: '55%',
    left: '30%',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1264F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1264F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  mapLabelVan: {
    position: 'absolute',
    top: '65%',
    left: '26%',
    fontSize: 11,
    fontWeight: '800',
    color: '#10213F',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  openExternalMapBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  openExternalMapText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1264F5'
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E'
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1264F5',
    letterSpacing: 0.5
  },
  etaText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
    marginLeft: 'auto'
  },
  techInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  techName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  techDesignation: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309'
  },
  callCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-around'
  },
  metricItem: {
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F',
    marginTop: 2
  },
  footerNote: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  footerNoteText: {
    fontSize: 11,
    color: '#64748B'
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
