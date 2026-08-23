import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi } from '../services/api';

const STATUS_TIMELINE_STEPS = [
  'Pending Verification',
  'Verified',
  'Assigned',
  'Accepted',
  'On The Way',
  'Arrived',
  'In Progress',
  'Completed'
];

export const BookingDetailScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Dialog State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await customerApi.getBookingById(bookingId);
      setBooking(data);
    } catch (e) {
      console.warn('BookingDetail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bookingId]);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Review Required', 'Please share a brief comment on your wash experience.');
      return;
    }
    setSubmittingReview(true);
    try {
      await customerApi.submitReview(bookingId, rating, comment);
      Alert.alert('Review Submitted! ⭐', 'Thank you for rating AquaGo Wash.');
      setShowReviewModal(false);
      fetchDetail();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#1264F5" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const currentStatusLower = (booking.status || '').toLowerCase();
  const currentStepIdx = STATUS_TIMELINE_STEPS.findIndex(
    s => s.toLowerCase() === currentStatusLower
  );
  const isEnRoute = ['on the way', 'arrived', 'in progress'].includes(currentStatusLower);
  const isCompleted = currentStatusLower === 'completed' || currentStatusLower === 'customer reviewed';

  const beforePhotos = booking.beforePhotos || (booking.photos || []).filter(p => p.photoType === 'BEFORE');
  const afterPhotos = booking.afterPhotos || (booking.photos || []).filter(p => p.photoType === 'AFTER');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header Card */}
      <View style={styles.card}>
        <View style={styles.refRow}>
          <Text style={styles.refBadge}>BOOKING REFERENCE</Text>
          <Text style={styles.statusTag}>{booking.status}</Text>
        </View>
        <Text style={styles.bookingNumber}>#{booking.bookingNumber || booking.id}</Text>
        <Text style={styles.serviceTitle}>{booking.service?.name}</Text>
        <Text style={styles.scheduleText}>📅 Scheduled: {booking.date} ({booking.timeSlot})</Text>

        {isEnRoute && (
          <TouchableOpacity
            style={styles.trackCtaBtn}
            onPress={() => navigation.navigate('LiveTracking', { bookingId: booking.id })}
          >
            <Ionicons name="navigate-circle" size={20} color="#FFFFFF" />
            <Text style={styles.trackCtaText}>Track Technician Live Map</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Booking Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Lifecycle Timeline</Text>
        <View style={styles.timelineList}>
          {STATUS_TIMELINE_STEPS.map((stepName, idx) => {
            const isPassed = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <View key={stepName} style={styles.timelineItem}>
                <View style={styles.stepIconColumn}>
                  <View
                    style={[
                      styles.stepDot,
                      isPassed && styles.stepDotPassed,
                      isCurrent && styles.stepDotCurrent
                    ]}
                  >
                    {isPassed ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <View style={styles.stepInnerDot} />
                    )}
                  </View>
                  {idx < STATUS_TIMELINE_STEPS.length - 1 && (
                    <View style={[styles.stepLine, isPassed && styles.stepLinePassed]} />
                  )}
                </View>

                <View style={styles.stepTextCol}>
                  <Text style={[styles.stepLabel, isPassed && styles.stepLabelPassed]}>
                    {stepName}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.stepActiveBadge}>ACTIVE PHASE</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Technician Specialist Card (if assigned) */}
      {booking.employee && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned Mobile Specialist</Text>
          <View style={styles.techProfileRow}>
            <Image
              source={{ uri: booking.employee.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' }}
              style={styles.techAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.techName}>{booking.employee.name}</Text>
              <Text style={styles.techRole}>{booking.employee.designation || 'Wash Specialist'}</Text>
              <View style={styles.techRatingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.techRatingText}>{booking.employee.rating || '4.9'} Rating</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={18} color="#1264F5" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Vehicle & Doorstep Address */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle & Location</Text>
        <View style={styles.infoRow}>
          <Ionicons name="car" size={16} color="#1264F5" />
          <View>
            <Text style={styles.infoTitle}>
              {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Vehicle'}
            </Text>
            <Text style={styles.infoSub}>{booking.vehicle?.regNumber || 'KA-09-MA-7821'}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { marginTop: 12 }]}>
          <Ionicons name="location" size={16} color="#EF4444" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Service Address</Text>
            <Text style={styles.infoSub}>
              {booking.address ? `${booking.address.house}, ${booking.address.area}, ${booking.address.city}` : 'Mysuru'}
            </Text>
          </View>
        </View>
      </View>

      {/* Before & After Wash Photos (if available) */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Wash Verification Photos</Text>
          
          {beforePhotos.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.photoHeader}>Before Wash:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 8 }}>
                {beforePhotos.map((p, i) => (
                  <Image key={i} source={{ uri: p.fileUrl }} style={styles.verificationImg} />
                ))}
              </ScrollView>
            </View>
          )}

          {afterPhotos.length > 0 && (
            <View>
              <Text style={styles.photoHeader}>After Wash:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 8 }}>
                {afterPhotos.map((p, i) => (
                  <Image key={i} source={{ uri: p.fileUrl }} style={styles.verificationImg} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Review Section */}
      {isCompleted && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Feedback & Rating</Text>
          {booking.review ? (
            <View style={styles.existingReviewBox}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= (booking.review.rating || 5) ? "star" : "star-outline"}
                    size={16}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>"{booking.review.comment || booking.review.feedback}"</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() => setShowReviewModal(true)}
            >
              <Ionicons name="star-outline" size={18} color="#FFFFFF" />
              <Text style={styles.rateBtnText}>Rate Your Experience</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* REVIEW MODAL SHEET */}
      {showReviewModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Doorstep Wash ⭐</Text>
            <Text style={styles.modalSub}>How satisfied are you with technician {booking.employee?.name || 'Venkatesh'}?</Text>

            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons
                    name={s <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your feedback (e.g. showroom shine, on-time arrival)..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitReviewText}>Submit Review</Text>
                )}
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
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5',
    gap: 8
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  refBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1264F5',
    letterSpacing: 0.5
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  bookingNumber: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#10213F'
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10213F'
  },
  scheduleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  trackCtaBtn: {
    backgroundColor: '#1264F5',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  trackCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F',
    marginBottom: 6
  },
  timelineList: {
    marginTop: 8,
    gap: 2
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepIconColumn: {
    alignItems: 'center',
    width: 28
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepDotPassed: {
    backgroundColor: '#16A34A'
  },
  stepDotCurrent: {
    backgroundColor: '#1264F5'
  },
  stepInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8'
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginVertical: 2
  },
  stepLinePassed: {
    backgroundColor: '#16A34A'
  },
  stepTextCol: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  stepLabelPassed: {
    fontWeight: '800',
    color: '#10213F'
  },
  stepActiveBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1264F5',
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  techProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4
  },
  techAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  techName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  techRole: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  techRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  techRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309'
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10213F'
  },
  infoSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  photoHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6
  },
  verificationImg: {
    width: 120,
    height: 90,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#E2E8F0'
  },
  rateBtn: {
    backgroundColor: '#1264F5',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  rateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  existingReviewBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4
  },
  starRow: {
    flexDirection: 'row',
    gap: 2
  },
  reviewComment: {
    fontSize: 12,
    color: '#10213F',
    fontStyle: 'italic'
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
    fontSize: 18,
    fontWeight: '900',
    color: '#10213F'
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B'
  },
  starPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8
  },
  commentInput: {
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
    gap: 10,
    marginTop: 6
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B'
  },
  submitReviewBtn: {
    flex: 2,
    backgroundColor: '#1264F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  submitReviewText: {
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
