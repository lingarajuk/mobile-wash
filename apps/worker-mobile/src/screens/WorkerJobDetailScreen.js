import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { workerApi } from '../services/api';

export const WorkerJobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Work Update Modal / Input
  const [workUpdateText, setWorkUpdateText] = useState('');
  const [workUpdates, setWorkUpdates] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchJob = async () => {
    try {
      const data = await workerApi.getJobById(jobId);
      setJob(data);
      if (data.workUpdates) setWorkUpdates(data.workUpdates);
    } catch (e) {
      console.warn('Worker job detail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  // Status Action Transitions
  const handleUpdateStatus = async (nextStatus, note = '') => {
    setActionLoading(true);
    try {
      if (nextStatus === 'On The Way') {
        // Request GPS Location & Broadcast
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          await workerApi.broadcastLocation(
            jobId,
            loc.coords.latitude,
            loc.coords.longitude,
            loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : 32,
            loc.coords.heading || 0
          );
        }
      }

      await workerApi.updateJobStatus(jobId, nextStatus, note);
      Alert.alert('Status Updated', `Job marked as "${nextStatus}"`);
      fetchJob();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update job status');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Navigation
  const openNavigation = () => {
    const lat = job?.address?.latitude || 12.3118;
    const lng = job?.address?.longitude || 76.6529;
    const label = encodeURIComponent(job?.customerName || 'Customer Doorstep');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    Linking.openURL(url);
  };

  // Photo Capture
  const handleTakePhoto = async (photoType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Required', 'Please enable camera access to take wash verification photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await workerApi.uploadPhoto(jobId, photoType, photoUri);
        Alert.alert('Photo Uploaded', `${photoType} wash photo attached successfully.`);
        fetchJob();
      }
    } catch (e) {
      console.warn('Camera upload error:', e);
    }
  };

  // Post Work Update Note
  const handlePostWorkUpdate = async () => {
    if (!workUpdateText.trim()) return;
    try {
      await workerApi.addWorkUpdate(jobId, 'Service Update', workUpdateText);
      setWorkUpdateText('');
      setShowUpdateModal(false);
      fetchJob();
    } catch (e) {
      Alert.alert('Error', 'Failed to record work update');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#1264F5" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>Job record not found.</Text>
      </View>
    );
  }

  const s = (job.status || '').toLowerCase();
  const beforePhotos = job.beforePhotos || (job.photos || []).filter(p => p.photoType === 'BEFORE');
  const afterPhotos = job.afterPhotos || (job.photos || []).filter(p => p.photoType === 'AFTER');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. TOP STATUS & ACTION CONSOLE */}
      <View style={styles.actionConsoleCard}>
        <View style={styles.statusRow}>
          <Text style={styles.consoleTag}>CURRENT JOB STATUS</Text>
          <Text style={styles.statusBadgeText}>{job.status}</Text>
        </View>

        <Text style={styles.jobTitle}>#{job.bookingNumber || job.id}</Text>
        <Text style={styles.jobServiceText}>{job.service?.name}</Text>

        {/* PRIMARY ACTION BUTTON BASED ON LIFECYCLE */}
        <View style={styles.actionButtonArea}>
          {s === 'assigned' && (
            <TouchableOpacity
              style={[styles.bigActionBtn, { backgroundColor: '#1264F5' }]}
              onPress={() => handleUpdateStatus('Accepted', 'Specialist accepted the dispatch')}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.bigActionBtnText}>Accept Job</Text>
            </TouchableOpacity>
          )}

          {s === 'accepted' && (
            <TouchableOpacity
              style={[styles.bigActionBtn, { backgroundColor: '#D97706' }]}
              onPress={() => handleUpdateStatus('On The Way', 'Van en route to customer doorstep')}
              disabled={actionLoading}
            >
              <Ionicons name="car" size={20} color="#FFFFFF" />
              <Text style={styles.bigActionBtnText}>Start Travel (GPS On)</Text>
            </TouchableOpacity>
          )}

          {s === 'on the way' && (
            <TouchableOpacity
              style={[styles.bigActionBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => handleUpdateStatus('Arrived', 'Specialist arrived at customer location')}
              disabled={actionLoading}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" />
              <Text style={styles.bigActionBtnText}>I've Arrived at Doorstep</Text>
            </TouchableOpacity>
          )}

          {s === 'arrived' && (
            <TouchableOpacity
              style={[styles.bigActionBtn, { backgroundColor: '#7C3AED' }]}
              onPress={() => handleUpdateStatus('In Progress', 'Foam cannon setup & wash initiated')}
              disabled={actionLoading}
            >
              <Ionicons name="water" size={20} color="#FFFFFF" />
              <Text style={styles.bigActionBtnText}>Start Wash Service</Text>
            </TouchableOpacity>
          )}

          {s === 'in progress' && (
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.bigActionBtn, { backgroundColor: '#16A34A' }]}
                onPress={() => handleUpdateStatus('Completed', 'Wash, dry, and tire polish complete')}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.bigActionBtnText}>Complete Wash Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.workUpdateBtn}
                onPress={() => setShowUpdateModal(true)}
              >
                <Ionicons name="chatbox-ellipses-outline" size={18} color="#1264F5" />
                <Text style={styles.workUpdateBtnText}>+ Post Live Work Update</Text>
              </TouchableOpacity>
            </View>
          )}

          {(s === 'completed' || s === 'customer reviewed') && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
              <Text style={styles.completedBannerText}>Wash Completed & Verified ✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. CUSTOMER & NAVIGATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Customer & Doorstep Location</Text>
          <TouchableOpacity style={styles.navBtn} onPress={openNavigation}>
            <Ionicons name="navigate" size={14} color="#FFFFFF" />
            <Text style={styles.navBtnText}>Navigate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.customerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{job.customerName || 'Rahul Sharma'}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${job.customerPhone}`)}>
              <Text style={styles.customerPhone}>📞 {job.customerPhone || '+91 98765 43210'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.callCircle}
            onPress={() => Linking.openURL(`tel:${job.customerPhone}`)}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
            📍 {job.address ? `${job.address.house}, ${job.address.street ? job.address.street + ', ' : ''}${job.address.area}, ${job.address.city}` : 'Mysuru'}
          </Text>
          {job.address?.landmark && (
            <Text style={styles.landmarkText}>Landmark: {job.address.landmark}</Text>
          )}
        </View>
      </View>

      {/* 3. VEHICLE & PRE-WASH INSPECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
        <View style={styles.vehicleRow}>
          <Ionicons name="car-sport" size={20} color="#1264F5" />
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>
              {job.vehicle ? `${job.vehicle.brand} ${job.vehicle.model}` : 'Vehicle'}
            </Text>
            <Text style={styles.vehiclePlate}>{job.vehicle?.regNumber || 'KA-09-MA-7821'}</Text>
          </View>
          <Text style={styles.vehicleConditionBadge}>{job.vehicleCondition || 'Normal Dirt'}</Text>
        </View>

        {/* PHOTO CAPTURE WORKFLOW */}
        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Wash Inspection Photos</Text>
        
        <View style={styles.photoActionRow}>
          <TouchableOpacity
            style={styles.photoCaptureBtn}
            onPress={() => handleTakePhoto('BEFORE')}
          >
            <Ionicons name="camera" size={18} color="#1264F5" />
            <Text style={styles.photoCaptureText}>Take Before Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.photoCaptureBtn, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}
            onPress={() => handleTakePhoto('AFTER')}
          >
            <Ionicons name="camera" size={18} color="#16A34A" />
            <Text style={[styles.photoCaptureText, { color: '#16A34A' }]}>Take After Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Display Uploaded Photos */}
        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <ScrollView horizontal style={styles.photosScroll} showsHorizontalScrollIndicator={false}>
            {beforePhotos.map((p, i) => (
              <View key={`b-${i}`} style={styles.photoThumbWrap}>
                <Image source={{ uri: p.fileUrl }} style={styles.photoThumb} />
                <Text style={styles.photoThumbLabel}>BEFORE</Text>
              </View>
            ))}
            {afterPhotos.map((p, i) => (
              <View key={`a-${i}`} style={styles.photoThumbWrap}>
                <Image source={{ uri: p.fileUrl }} style={styles.photoThumb} />
                <Text style={[styles.photoThumbLabel, { backgroundColor: '#16A34A' }]}>AFTER</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 4. WORK UPDATE LOG */}
      {workUpdates.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Work Update Timeline</Text>
          <View style={styles.updateList}>
            {workUpdates.map((u, i) => (
              <View key={i} style={styles.updateItem}>
                <View style={styles.updateDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.updateMsg}>{u.message || u.note}</Text>
                  <Text style={styles.updateTime}>{u.createdAt || 'Just now'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* MODAL: POST WORK UPDATE */}
      {showUpdateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Post Work Progress Note 📝</Text>
            <Text style={styles.modalSub}>This update is instantly visible to the customer and admin.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Foam cannon applied, scrubbing wheels..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={workUpdateText}
              onChangeText={setWorkUpdateText}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowUpdateModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handlePostWorkUpdate}
              >
                <Text style={styles.modalSubmitText}>Post Update</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    gap: 16,
    paddingBottom: 50
  },
  actionConsoleCard: {
    backgroundColor: '#10213F',
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  consoleTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  jobTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFFFFF'
  },
  jobServiceText: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600'
  },
  actionButtonArea: {
    marginTop: 10
  },
  bigActionBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  bigActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900'
  },
  workUpdateBtn: {
    backgroundColor: '#F0F6FF',
    borderRadius: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  workUpdateBtnText: {
    color: '#1264F5',
    fontSize: 12,
    fontWeight: '800'
  },
  completedBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  completedBannerText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '900'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  navBtn: {
    backgroundColor: '#1264F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  customerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  customerPhone: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1264F5',
    marginTop: 2
  },
  callCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2
  },
  addressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10213F',
    lineHeight: 16
  },
  landmarkText: {
    fontSize: 11,
    color: '#64748B'
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  vehiclePlate: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1264F5'
  },
  vehicleConditionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  photoCaptureBtn: {
    flex: 1,
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  photoCaptureText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1264F5'
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8
  },
  photoThumbWrap: {
    position: 'relative',
    marginRight: 8
  },
  photoThumb: {
    width: 100,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0'
  },
  photoThumbLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4
  },
  updateList: {
    marginTop: 6,
    gap: 10
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1264F5',
    marginTop: 4
  },
  updateMsg: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10213F'
  },
  updateTime: {
    fontSize: 10,
    color: '#94A3B8'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16,33,63,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    gap: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F'
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B'
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: '#10213F',
    textAlignVertical: 'top'
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B'
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: '#1264F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444'
  }
});
