import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { customerApi } from '../services/api';

const TIME_SLOTS = [
  '08:00 AM - 09:30 AM',
  '10:00 AM - 11:30 AM',
  '12:00 PM - 01:30 PM',
  '02:30 PM - 04:00 PM',
  '04:30 PM - 06:00 PM',
  '06:30 PM - 08:00 PM'
];

const AVAILABLE_ADDONS = [
  { id: 'addon-1', name: 'Alloy Wheel Ceramic Polish', price: 149 },
  { id: 'addon-2', name: 'Interior AC Vent Sanitization', price: 99 },
  { id: 'addon-3', name: 'Rain-X Windshield Treatment', price: 199 }
];

export const BookingFlowScreen = ({ navigation, route }) => {
  const selectedService = route.params?.service || {
    id: 'srv-1',
    name: 'Premium Doorstep Foam Wash',
    price: 499
  };

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form State
  const [vehicle, setVehicle] = useState({
    type: 'car',
    brand: 'Honda',
    model: 'City ZX',
    regNumber: 'KA-09-MA-7821',
    color: 'Platinum White',
    condition: 'Normal Dirt'
  });

  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });

  const [address, setAddress] = useState({
    house: 'No. 42, 3rd Floor',
    street: '1st Cross, Jayalakshmipuram',
    area: 'Vijayanagar',
    city: 'Mysuru',
    pincode: '570012',
    landmark: 'Opposite City Center Bank'
  });

  // Tomorrow as default date YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [selectedAddons, setSelectedAddons] = useState(['addon-1']);
  const [paymentMethod, setPaymentMethod] = useState('Cash After Service');

  // Photo Picker
  const pickPhoto = async (angle) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera roll access is needed to select vehicle photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos(prev => ({ ...prev, [angle]: result.assets[0].uri }));
      }
    } catch (e) {
      console.warn('Photo picker error:', e);
    }
  };

  // Pricing calculations
  const basePrice = Number(selectedService.price) || 499;
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = AVAILABLE_ADDONS.find(a => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);
  const totalAmount = basePrice + addonsTotal;

  // Submit Booking
  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        serviceId: selectedService.id.toString(),
        date: bookingDate,
        timeSlot: timeSlot,
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          regNumber: vehicle.regNumber,
          type: vehicle.type,
          color: vehicle.color
        },
        vehicleCondition: vehicle.condition,
        address: address,
        addons: selectedAddons.map(id => AVAILABLE_ADDONS.find(a => a.id === id)).filter(Boolean),
        paymentMethod: paymentMethod,
        finalAmount: totalAmount,
        photos: Object.entries(photos)
          .filter(([_, uri]) => uri !== null)
          .map(([angle, uri]) => ({ photoType: angle.toUpperCase(), fileUrl: uri }))
      };

      const res = await customerApi.createBooking(payload);
      setConfirmedBooking(res);
      setStep(8); // Step 8: Confirmation
    } catch (e) {
      Alert.alert('Booking Error', e.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator Header */}
      {step < 8 && (
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>
            Step {step} of 7: {
              step === 1 ? 'Select Service' :
              step === 2 ? 'Vehicle Details' :
              step === 3 ? 'Doorstep Location' :
              step === 4 ? 'Schedule Date & Slot' :
              step === 5 ? 'Select Add-ons' :
              step === 6 ? 'Review Booking' : 'Payment Method'
            }
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 7) * 100}%` }]} />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* STEP 1: SERVICE SUMMARY */}
        {step === 1 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Selected Wash Package</Text>
              <Text style={styles.serviceName}>{selectedService.name}</Text>
              <Text style={styles.servicePrice}>₹{selectedService.price}</Text>
              <Text style={styles.helperText}>
                Includes full exterior foam cannon wash, glass polishing, tire dressing, and interior dry vacuuming.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 2: VEHICLE & PHOTOS */}
        {step === 2 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Vehicle Specifications</Text>

              <Text style={styles.inputLabel}>Brand & Make</Text>
              <TextInput
                style={styles.input}
                value={vehicle.brand}
                onChangeText={(v) => setVehicle({ ...vehicle, brand: v })}
                placeholder="e.g. Honda, Hyundai, Toyota"
              />

              <Text style={styles.inputLabel}>Model & Variant</Text>
              <TextInput
                style={styles.input}
                value={vehicle.model}
                onChangeText={(v) => setVehicle({ ...vehicle, model: v })}
                placeholder="e.g. City ZX, Creta SX"
              />

              <Text style={styles.inputLabel}>Registration Plate Number</Text>
              <TextInput
                style={styles.input}
                value={vehicle.regNumber}
                onChangeText={(v) => setVehicle({ ...vehicle, regNumber: v.toUpperCase() })}
                placeholder="e.g. KA-09-MA-7821"
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>Vehicle Condition</Text>
              <TextInput
                style={styles.input}
                value={vehicle.condition}
                onChangeText={(v) => setVehicle({ ...vehicle, condition: v })}
                placeholder="e.g. Normal Dirt, Heavy Mud"
              />

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Vehicle Inspection Photos</Text>
              <Text style={styles.helperText}>Upload front, back, and side angles to verify pre-wash condition.</Text>
              
              <View style={styles.photoGrid}>
                {['front', 'back', 'left', 'right'].map((angle) => (
                  <TouchableOpacity
                    key={angle}
                    style={styles.photoSlot}
                    onPress={() => pickPhoto(angle)}
                  >
                    {photos[angle] ? (
                      <Image source={{ uri: photos[angle] }} style={styles.uploadedPhoto} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera-outline" size={24} color="#1264F5" />
                        <Text style={styles.photoAngleLabel}>{angle.toUpperCase()}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Doorstep Service Address</Text>
              
              <Text style={styles.inputLabel}>House / Flat / Building</Text>
              <TextInput
                style={styles.input}
                value={address.house}
                onChangeText={(v) => setAddress({ ...address, house: v })}
              />

              <Text style={styles.inputLabel}>Street & Landmark</Text>
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(v) => setAddress({ ...address, street: v })}
              />

              <Text style={styles.inputLabel}>Area / Locality</Text>
              <TextInput
                style={styles.input}
                value={address.area}
                onChangeText={(v) => setAddress({ ...address, area: v })}
              />

              <Text style={styles.inputLabel}>City & Pincode</Text>
              <TextInput
                style={styles.input}
                value={`${address.city} – ${address.pincode}`}
                onChangeText={(v) => setAddress({ ...address, city: v })}
              />
            </View>
          </View>
        )}

        {/* STEP 4: DATE & TIME */}
        {step === 4 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Select Schedule Date</Text>
              <TextInput
                style={styles.input}
                value={bookingDate}
                onChangeText={setBookingDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Available Arrival Slots</Text>
              <View style={styles.slotsGrid}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotBtn, timeSlot === slot && styles.slotBtnActive]}
                    onPress={() => setTimeSlot(slot)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={timeSlot === slot ? '#FFFFFF' : '#1264F5'}
                    />
                    <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* STEP 5: ADD-ONS */}
        {step === 5 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Enhance Your Wash</Text>
              {AVAILABLE_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    style={[styles.addonRow, isChecked && styles.addonRowSelected]}
                    onPress={() => {
                      if (isChecked) {
                        setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                      } else {
                        setSelectedAddons([...selectedAddons, addon.id]);
                      }
                    }}
                  >
                    <Ionicons
                      name={isChecked ? "checkbox" : "square-outline"}
                      size={20}
                      color={isChecked ? "#1264F5" : "#94A3B8"}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.addonName}>{addon.name}</Text>
                    </View>
                    <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 6: REVIEW */}
        {step === 6 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Booking Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Package:</Text>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Vehicle:</Text>
                <Text style={styles.summaryValue}>{vehicle.brand} {vehicle.model} ({vehicle.regNumber})</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryValue}>{address.house}, {address.area}, {address.city}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Schedule:</Text>
                <Text style={styles.summaryValue}>{bookingDate} ({timeSlot})</Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Base Price:</Text>
                <Text style={styles.summaryValue}>₹{basePrice}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Add-ons:</Text>
                <Text style={styles.summaryValue}>₹{addonsTotal}</Text>
              </View>
              <View style={[styles.summaryItem, { marginTop: 6 }]}>
                <Text style={styles.totalLabel}>Total Payable:</Text>
                <Text style={styles.totalPrice}>₹{totalAmount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 7: PAYMENT */}
        {step === 7 && (
          <View style={styles.stepBody}>
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Choose Payment Method</Text>
              {['Cash After Service', 'UPI (Google Pay / PhonePe)', 'Credit / Debit Card'].map((pm) => (
                <TouchableOpacity
                  key={pm}
                  style={[styles.paymentRow, paymentMethod === pm && styles.paymentRowActive]}
                  onPress={() => setPaymentMethod(pm)}
                >
                  <Ionicons
                    name={paymentMethod === pm ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={paymentMethod === pm ? "#1264F5" : "#94A3B8"}
                  />
                  <Text style={styles.paymentText}>{pm}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 8: CONFIRMATION */}
        {step === 8 && (
          <View style={styles.confirmationCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
            </View>
            <Text style={styles.confirmTitle}>Booking Confirmed! 🎉</Text>
            <Text style={styles.confirmId}>
              Booking ID: #{confirmedBooking?.bookingNumber || confirmedBooking?.id || 'AGW-87217'}
            </Text>
            <Text style={styles.confirmMsg}>
              Your certified technician van has been queued for verification and dispatch to your doorstep in Mysuru.
            </Text>

            <TouchableOpacity
              style={styles.primaryBtnLarge}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <Text style={styles.primaryBtnLargeText}>View My Bookings</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer Buttons */}
      {step < 8 && (
        <View style={styles.footerBar}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              if (step === 7) {
                handleConfirmBooking();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {step === 7 ? `Pay ₹${totalAmount} & Confirm` : 'Next Step'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  stepHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECF5'
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10213F',
    marginBottom: 8
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1264F5',
    borderRadius: 2
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100
  },
  stepBody: {
    gap: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6ECF5'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10213F',
    marginBottom: 12
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1264F5',
    marginBottom: 4
  },
  servicePrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10213F',
    marginBottom: 8
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#10213F'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12
  },
  photoSlot: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 4
  },
  photoAngleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1264F5'
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%'
  },
  slotsGrid: {
    gap: 8
  },
  slotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC'
  },
  slotBtnActive: {
    backgroundColor: '#1264F5',
    borderColor: '#1264F5'
  },
  slotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10213F'
  },
  slotTextActive: {
    color: '#FFFFFF'
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFC'
  },
  addonRowSelected: {
    borderColor: '#1264F5',
    backgroundColor: '#F0F6FF'
  },
  addonName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10213F'
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1264F5'
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10213F',
    maxWidth: '65%',
    textAlign: 'right'
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10213F'
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1264F5'
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    gap: 10
  },
  paymentRowActive: {
    borderColor: '#1264F5',
    backgroundColor: '#F0F6FF'
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10213F'
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    marginTop: 20
  },
  successIconWrap: {
    marginBottom: 16
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10213F',
    marginBottom: 6
  },
  confirmId: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1264F5',
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12
  },
  confirmMsg: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24
  },
  primaryBtnLarge: {
    backgroundColor: '#1264F5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center'
  },
  primaryBtnLargeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900'
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6ECF5',
    padding: 16,
    flexDirection: 'row',
    gap: 10
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569'
  },
  nextBtn: {
    flex: 2,
    backgroundColor: '#1264F5',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
