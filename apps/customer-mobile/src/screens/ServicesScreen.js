import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi } from '../services/api';

export const ServicesScreen = ({ navigation, route }) => {
  const initialType = route.params?.vehicleType || 'all';
  const [selectedType, setSelectedType] = useState(initialType);
  const [search, setSearch] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [selectedType]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getServices(selectedType);
      setServices(data);
    } catch (e) {
      console.warn('Failed to load services:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          placeholder="Search doorstep wash packages..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Vehicle Type Tabs */}
      <View style={styles.typeTabs}>
        {[
          { id: 'all', label: 'All Packages' },
          { id: 'car', label: 'Car / Sedan' },
          { id: 'suv', label: 'SUV / 4x4' },
          { id: 'bike', label: 'Bike / Scooter' }
        ].map((tab) => {
          const isSelected = selectedType === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.typeTab, isSelected && styles.typeTabActive]}
              onPress={() => setSelectedType(tab.id)}
            >
              <Text style={[styles.typeTabText, isSelected && styles.typeTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Services List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1264F5" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BookingFlow', { service: item })}
            >
              <Image
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80' }}
                style={styles.cardImage}
              />
              <View style={styles.cardBody}>
                <View style={styles.headerRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating || '4.9'}</Text>
                  </View>
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                <View style={styles.featureRow}>
                  <View style={styles.tag}>
                    <Ionicons name="time-outline" size={12} color="#1264F5" />
                    <Text style={styles.tagText}>{item.duration || '45 mins'}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Ionicons name="shield-checkmark-outline" size={12} color="#16A34A" />
                    <Text style={styles.tagText}>Eco Certified</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.priceLabel}>All-inclusive price</Text>
                    <Text style={styles.price}>₹{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate('BookingFlow', { service: item })}
                  >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="car-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or vehicle filter.</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    height: 48
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#10213F'
  },
  typeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8
  },
  typeTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5'
  },
  typeTabActive: {
    backgroundColor: '#1264F5',
    borderColor: '#1264F5'
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2E8F0'
  },
  cardBody: {
    padding: 16,
    gap: 8
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F',
    flex: 1,
    marginRight: 8
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309'
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500'
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  bookBtn: {
    backgroundColor: '#1264F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bookBtnText: {
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
