import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { customerApi } from '../services/api';

export const HomeScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  const fetchData = async () => {
    try {
      const [srvList, bookingsList] = await Promise.all([
        customerApi.getServices().catch(() => []),
        customerApi.getBookings().catch(() => [])
      ]);
      setServices(srvList.slice(0, 4));

      // Find active job if on the way or in progress
      const ongoing = bookingsList.find(b =>
        ['on the way', 'arrived', 'in progress', 'assigned'].includes((b.status || '').toLowerCase())
      );
      setActiveBooking(ongoing || null);
    } catch (e) {
      console.warn('Home fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#1264F5" />
            <Text style={styles.locationText}>Mysuru, Karnataka</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </View>
          <Text style={styles.greetingText}>Good Morning, Rahul 👋</Text>
          <Text style={styles.subGreeting}>Your vehicle deserves the best care.</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#10213F" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* Active Service Banner (if ongoing) */}
      {activeBooking && (
        <TouchableOpacity
          style={styles.activeJobBanner}
          onPress={() => navigation.navigate('LiveTracking', { bookingId: activeBooking.id })}
        >
          <View style={styles.activeJobHeader}>
            <View style={styles.pulseIndicator} />
            <Text style={styles.activeJobBadge}>LIVE TECHNICIAN EN ROUTE</Text>
            <Text style={styles.activeJobId}>#{activeBooking.bookingNumber || activeBooking.id}</Text>
          </View>
          <Text style={styles.activeJobTitle}>
            {activeBooking.employee?.name || 'Technician'} is on the way 🚗
          </Text>
          <Text style={styles.activeJobSub}>
            {activeBooking.service?.name} • Tap to view real-time GPS tracking
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Action CTA Cards */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>PREMIUM DOORSTEP SERVICE</Text>
          <Text style={styles.heroTitle}>Eco-Friendly Mobile Foam Wash</Text>
          <Text style={styles.heroDesc}>Certified technicians arrive at your home or office equipped with power & water.</Text>
          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={styles.primaryBtnText}>Book a Wash</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={styles.secondaryBtnText}>View Packages</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vehicle Category Selector */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Your Vehicle</Text>
      </View>
      <View style={styles.categoryRow}>
        {[
          { type: 'car', label: 'Car & Sedan', icon: 'car-sport' },
          { type: 'suv', label: 'SUV / 4x4', icon: 'car' },
          { type: 'bike', label: 'Bike / Scooter', icon: 'bicycle' },
          { type: 'luxury', label: 'Luxury Detail', icon: 'sparkles' }
        ].map((cat, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Services', { vehicleType: cat.type })}
          >
            <View style={styles.categoryIconWrap}>
              <Ionicons name={cat.icon} size={24} color="#1264F5" />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Services Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Doorstep Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1264F5" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('BookingFlow', { service })}
            >
              <Image
                source={{ uri: service.image || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80' }}
                style={styles.serviceImg}
              />
              <View style={styles.serviceCardBody}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{service.rating || '4.9'}</Text>
                  <Text style={styles.durationText}>• {service.duration || '45 mins'}</Text>
                </View>
                <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>₹{service.price}</Text>
                  <TouchableOpacity
                    style={styles.bookNowBtn}
                    onPress={() => navigation.navigate('BookingFlow', { service })}
                  >
                    <Text style={styles.bookNowBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1264F5'
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10213F'
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notifBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 10,
    right: 12
  },
  activeJobBanner: {
    backgroundColor: '#10213F',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1264F5'
  },
  activeJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E'
  },
  activeJobBadge: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  activeJobId: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 'auto'
  },
  activeJobTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2
  },
  activeJobSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600'
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    shadowColor: '#10213F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2
  },
  heroContent: {
    gap: 8
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1264F5',
    letterSpacing: 1
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10213F'
  },
  heroDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '600'
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#1264F5',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryBtnText: {
    color: '#1264F5',
    fontSize: 13,
    fontWeight: '800'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1264F5'
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF5'
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10213F',
    textAlign: 'center'
  },
  servicesGrid: {
    gap: 14
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1
  },
  serviceImg: {
    width: 110,
    height: 125,
    backgroundColor: '#E2E8F0'
  },
  serviceCardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10213F'
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  serviceDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  bookNowBtn: {
    backgroundColor: '#1264F5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  }
});
