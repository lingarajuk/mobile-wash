import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
import { Modal } from '@shared/components/Modal';
import { Select } from '@shared/components/Select';
import { INITIAL_EMPLOYEES } from '@shared/data/mockData';
import { adminService, bookingService } from '@shared/services/api';
import {
  Search,
  RefreshCw,
  UserCheck,
  XCircle,
  Eye,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
  Car,
  Camera,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  User,
  Wand2,
  X
} from 'lucide-react';

export const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const { updateBookingStatus } = useAuth();
  const { addToast } = useToast();

  const [adminBookings, setAdminBookings] = useState([]);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected Booking Drawer/Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Assign Modal State
  const [assignModalBooking, setAssignModalBooking] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState(INITIAL_EMPLOYEES[0]?.id || '');

  // Reject Modal State
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Image Lightbox Modal State
  const [enlargedImage, setEnlargedImage] = useState(null);

  const fetchAdminBookings = () => {
    setLoading(true);
    adminService.getBookings()
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminBookings(data);
          if (selectedBooking) {
            const updated = data.find(b => b.id === selectedBooking.id);
            if (updated) setSelectedBooking(updated);
          }
        }
      })
      .catch((err) => {
        console.error('Admin bookings fetch error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminBookings();
    adminService.getEmployees().then(empList => {
      if (Array.isArray(empList) && empList.length > 0) {
        setEmployees(empList);
        setSelectedEmpId(empList[0].id);
      }
    }).catch(() => {});
  }, []);

  const filtered = adminBookings.filter((b) => {
    const bIdStr = (b.bookingNumber || b.id || '').toLowerCase();
    const custStr = (b.customerName || '').toLowerCase();
    const phoneStr = (b.customerPhone || '').toLowerCase();
    const srvStr = (b.service?.name || '').toLowerCase();
    const vehStr = (b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} ${b.vehicle.regNumber}` : '').toLowerCase();

    const matchSearch = bIdStr.includes(search.toLowerCase()) ||
      custStr.includes(search.toLowerCase()) ||
      phoneStr.includes(search.toLowerCase()) ||
      srvStr.includes(search.toLowerCase()) ||
      vehStr.includes(search.toLowerCase());

    const bStatusStr = (b.status || '').toLowerCase();
    const fStatusStr = filterStatus.toLowerCase();

    const matchStatus = fStatusStr === 'all' || bStatusStr === fStatusStr;
    return matchSearch && matchStatus;
  });

  // Admin Verification
  const handleVerifyBooking = async (bookingId) => {
    try {
      await adminService.verifyBooking(bookingId);
      updateBookingStatus(bookingId, 'Verified', 1);
      addToast(`Booking #${bookingId} verified successfully! Status updated in database.`, 'success');
      fetchAdminBookings();
    } catch (e) {
      addToast(`Verification failed: ${e.message}`, 'error');
    }
  };

  // Admin Assignment
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!assignModalBooking || !selectedEmpId) return;

    try {
      const emp = employees.find(e => e.id === selectedEmpId) || { id: selectedEmpId, name: 'Venkatesh Kumar', phone: '+91 91234 56789' };
      await adminService.assignEmployee(assignModalBooking.id, emp);
      updateBookingStatus(assignModalBooking.id, 'Assigned', 1);
      addToast(`Technician ${emp.name} assigned to booking #${assignModalBooking.bookingNumber || assignModalBooking.id}!`, 'success');
      setAssignModalBooking(null);
      fetchAdminBookings();
    } catch (e) {
      addToast(`Assignment failed: ${e.message}`, 'error');
    }
  };

  // Admin Rejection
  const handleRejectBooking = async (e) => {
    e.preventDefault();
    if (!rejectModalBooking) return;

    try {
      await adminService.rejectBooking(rejectModalBooking.id, rejectionReason || 'Operational slot full');
      updateBookingStatus(rejectModalBooking.id, 'Rejected', 0);
      addToast(`Booking #${rejectModalBooking.bookingNumber || rejectModalBooking.id} has been rejected.`, 'info');
      setRejectModalBooking(null);
      setRejectionReason('');
      fetchAdminBookings();
    } catch (e) {
      addToast(`Rejection failed: ${e.message}`, 'error');
    }
  };

  // Metrics
  const totalCount = adminBookings.length;
  const pendingCount = adminBookings.filter(b => (b.status || '').toLowerCase().includes('pending')).length;
  const activeCount = adminBookings.filter(b => ['assigned', 'accepted', 'on the way', 'arrived', 'in progress'].includes((b.status || '').toLowerCase())).length;
  const completedCount = adminBookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn max-w-[1440px] mx-auto text-[#10213F]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-black uppercase text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-3 py-0.5 rounded-full">
              ADMIN CONTROL CENTER
            </span>
            <span className="text-xs font-bold text-[#475569]">MySQL Real-Time Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">
            Bookings & Dispatch Management 📋
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1 font-semibold">
            Verify pending washes, assign mobile technician vans, inspect customer photos, and track jobs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            onClick={fetchAdminBookings}
            variant="secondary"
            size="md"
            icon={RefreshCw}
            isLoading={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs bg-white ${
            filterStatus === 'all' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/40' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-black text-[#10213F] block font-mono mt-2">{totalCount}</span>
          <span className="text-[11px] text-[#475569] font-bold mt-1 block">All registered orders</span>
        </div>

        <div
          onClick={() => setFilterStatus('pending verification')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs bg-white ${
            filterStatus.includes('pending') ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/10 bg-[#FFFBEB]' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider block">Pending Verification</span>
          <span className="text-3xl font-black text-[#B45309] block font-mono mt-2">{pendingCount}</span>
          <span className="text-[11px] text-[#B45309] font-bold mt-1 block">Requires admin action</span>
        </div>

        <div
          onClick={() => setFilterStatus('assigned')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs bg-white ${
            filterStatus === 'assigned' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/40' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <span className="text-xs font-bold text-[#1264F5] uppercase tracking-wider block">Active & Dispatched</span>
          <span className="text-3xl font-black text-[#1264F5] block font-mono mt-2">{activeCount}</span>
          <span className="text-[11px] text-[#1264F5] font-bold mt-1 block">Assigned / In travel</span>
        </div>

        <div
          onClick={() => setFilterStatus('completed')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs bg-white ${
            filterStatus === 'completed' ? 'border-[#16A34A] ring-2 ring-[#16A34A]/10 bg-[#F0FDF4]' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider block">Completed Washes</span>
          <span className="text-3xl font-black text-[#15803D] block font-mono mt-2">{completedCount}</span>
          <span className="text-[11px] text-[#15803D] font-bold mt-1 block">Successfully serviced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6ECF5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#1264F5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] font-bold rounded-2xl py-2.5 pl-10 pr-3.5 outline-none focus:border-[#1264F5] focus:bg-white placeholder:text-[#64748B]"
          />
        </div>

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending verification', label: 'Pending Verification' },
            { value: 'verified', label: 'Verified' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'on the way', label: 'On The Way' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          className="sm:w-56"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E6ECF5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#10213F] font-black border-b border-[#E6ECF5]">
                <th className="p-4 uppercase tracking-wider text-[11px]">Booking ID</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Customer & Phone</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Service Package</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Vehicle Details</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Date & Time</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Location</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Amount</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Assigned Tech</th>
                <th className="p-4 uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-4 uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5]">
              {filtered.length > 0 ? (
                filtered.map((b) => {
                  const bStatusLower = (b.status || '').toLowerCase();
                  return (
                    <tr key={b.id || b.bookingNumber} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Booking ID */}
                      <td className="p-4 font-mono font-black text-[#1264F5] text-sm">
                        #{b.bookingNumber || b.id}
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-black text-[#10213F] text-sm">{b.customerName || 'Customer'}</div>
                        <div className="text-xs text-[#1264F5] font-mono font-bold mt-0.5">{b.customerPhone || '+91 98765 43210'}</div>
                      </td>

                      {/* Service */}
                      <td className="p-4 font-black text-[#10213F] text-sm max-w-[200px]">
                        {b.service?.name || 'Doorstep Wash Package'}
                      </td>

                      {/* Vehicle */}
                      <td className="p-4">
                        <div className="text-[#10213F] font-black text-xs">
                          {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : 'Honda City'}
                        </div>
                        <div className="text-xs text-[#10213F] font-mono font-black mt-0.5">
                          {b.vehicle?.regNumber || b.vehicle?.registration_number || 'KA-09-MA-7821'}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 text-[#10213F] font-bold whitespace-nowrap">
                        <div className="text-xs">{b.date}</div>
                        <div className="text-[11px] text-[#475569]">{b.timeSlot}</div>
                      </td>

                      {/* Location */}
                      <td className="p-4 text-[#10213F] font-semibold max-w-[160px] truncate" title={b.address?.area || 'Location'}>
                        {b.address ? `${b.address.house ? b.address.house + ', ' : ''}${b.address.area}, ${b.address.city}` : 'Mysuru'}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-black text-[#10213F] text-base font-mono">
                        ₹{b.finalAmount}
                      </td>

                      {/* Assigned Employee */}
                      <td className="p-4">
                        {b.employee?.name ? (
                          <span className="text-[#10213F] font-black flex items-center gap-1.5 bg-[#F0F6FF] px-2.5 py-1 rounded-xl border border-[#BFDBFE]">
                            👨‍🔧 {b.employee.name}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignModalBooking(b)}
                            className="text-[#1264F5] hover:text-[#0F52CC] text-xs font-black flex items-center gap-1 cursor-pointer underline bg-[#F0F6FF] px-2.5 py-1 rounded-xl border border-[#BFDBFE]"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> + Assign Tech
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Verify Button for Pending Verification */}
                          {(bStatusLower === 'pending verification' || bStatusLower === 'pending') && (
                            <button
                              type="button"
                              onClick={() => handleVerifyBooking(b.id)}
                              className="px-3 py-1.5 text-xs font-black text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              title="Verify Booking"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Verify
                            </button>
                          )}

                          {/* Reject Button */}
                          {(bStatusLower === 'pending verification' || bStatusLower === 'pending') && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalBooking(b);
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                              title="Reject Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/bookings/${b.id || b.bookingNumber}`)}
                            className="px-3.5 py-1.5 text-xs font-black text-white bg-[#1264F5] hover:bg-[#0F52CC] rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            title="View Full Booking Details Page"
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#475569] text-xs font-bold">
                    No bookings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ASSIGN TECHNICIAN */}
      <Modal
        isOpen={!!assignModalBooking}
        onClose={() => setAssignModalBooking(null)}
        title="Assign Mobile Technician Van"
        subtitle={`Booking #${assignModalBooking?.bookingNumber || assignModalBooking?.id} • ${assignModalBooking?.service?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignTechnician} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-black text-[#10213F] block mb-1.5">Choose Technician / Mobile Van</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] font-bold rounded-xl p-3 outline-none focus:border-[#1264F5]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.phone}) – {emp.role || emp.designation || 'Technician'} ⭐ {emp.rating || '4.9'}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] text-xs space-y-1">
            <span className="text-[10px] text-[#475569] uppercase font-bold block">Doorstep Target:</span>
            <p className="font-bold text-[#10213F]">{assignModalBooking?.customerName} • {assignModalBooking?.address?.area}, {assignModalBooking?.address?.city}</p>
            <p className="text-[11px] text-[#475569]">Scheduled: <strong className="text-[#10213F]">{assignModalBooking?.date} ({assignModalBooking?.timeSlot})</strong></p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setAssignModalBooking(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={UserCheck}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REJECT BOOKING */}
      <Modal
        isOpen={!!rejectModalBooking}
        onClose={() => setRejectModalBooking(null)}
        title="Reject Booking Request"
        subtitle={`Booking #${rejectModalBooking?.bookingNumber || rejectModalBooking?.id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRejectBooking} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-black text-[#10213F] block mb-1.5">Reason for Rejection</label>
            <textarea
              rows={3}
              placeholder="e.g. Technician vans fully occupied in this slot..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] font-bold rounded-xl p-3 outline-none focus:border-[#EF4444]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setRejectModalBooking(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" icon={XCircle}>
              Reject Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
