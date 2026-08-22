import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { INITIAL_EMPLOYEES } from '../../data/mockData';
import { adminService } from '../../services/api';
import { Search, RefreshCw, UserCheck, XCircle, Eye, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

export const AdminBookingsPage = () => {
  const { updateBookingStatus } = useAuth();
  const { addToast } = useToast();

  const [adminBookings, setAdminBookings] = useState([]);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignModalBooking, setAssignModalBooking] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState(INITIAL_EMPLOYEES[0].id);

  const fetchAdminBookings = () => {
    setLoading(true);
    adminService.getBookings()
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminBookings(data);
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

  const displayBookings = adminBookings;

  const filtered = displayBookings.filter((b) => {
    const bIdStr = (b.bookingNumber || b.id || '').toLowerCase();
    const srvStr = (b.service?.name || '').toLowerCase();
    const vehStr = (b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} ${b.vehicle.regNumber}` : '').toLowerCase();

    const matchSearch = bIdStr.includes(search.toLowerCase()) ||
      srvStr.includes(search.toLowerCase()) ||
      vehStr.includes(search.toLowerCase());

    const bStatusStr = (b.status || '').toLowerCase();
    const fStatusStr = filterStatus.toLowerCase();

    const matchStatus = fStatusStr === 'all' || bStatusStr === fStatusStr;
    return matchSearch && matchStatus;
  });

  const handleAcceptBooking = async (bookingId) => {
    try {
      await adminService.acceptBooking(bookingId);
      updateBookingStatus(bookingId, 'Confirmed', 1);
      addToast(`Booking #${bookingId} accepted & confirmed in MySQL!`, 'success');
      fetchAdminBookings();
    } catch (e) {
      addToast(`Failed to accept booking: ${e.message}`, 'error');
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!assignModalBooking) return;
    const bId = assignModalBooking.id || assignModalBooking.bookingNumber;
    try {
      await adminService.assignEmployee(bId, selectedEmpId);
      const emp = employees.find(e => e.id === selectedEmpId);
      updateBookingStatus(bId, 'Assigned', 1);
      addToast(`Technician ${emp?.name || 'Assigned'} linked to booking #${bId}`, 'success');
      setAssignModalBooking(null);
      fetchAdminBookings();
    } catch (err) {
      addToast(`Assignment failed: ${err.message}`, 'error');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
    addToast(`Booking #${bookingId} status updated to ${newStatus}`, 'info');
    fetchAdminBookings();
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Booking Management</h1>
          <p className="text-xs text-slate-400">View live customer bookings from MySQL, accept requests, and assign technicians</p>
        </div>

        <button
          onClick={fetchAdminBookings}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, service or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'on the way', label: 'On The Way' },
            { value: 'arrived', label: 'Arrived' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          className="sm:w-48"
        />
      </div>

      {/* Bookings Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-800">
                <th className="p-3.5">Booking ID</th>
                <th className="p-3.5">Service</th>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Date & Slot</th>
                <th className="p-3.5">Assigned Technician</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b.id || b.bookingNumber} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{b.bookingNumber || b.id}</td>
                    <td className="p-3.5 font-bold text-white">{b.service?.name || 'Service'}</td>
                    <td className="p-3.5 text-slate-300">
                      {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.regNumber})` : 'Vehicle'}
                    </td>
                    <td className="p-3.5 text-slate-300">{b.date} • {b.timeSlot}</td>
                    <td className="p-3.5 text-slate-200 font-medium">
                      {b.employee?.name ? (
                        <span className="text-cyan-300 font-semibold">{b.employee.name}</span>
                      ) : (
                        <button
                          onClick={() => setAssignModalBooking(b)}
                          className="text-amber-400 underline hover:text-amber-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" /> + Assign Tech
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{b.finalAmount}</td>
                    <td className="p-3.5"><StatusBadge status={b.status} /></td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status?.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => handleAcceptBooking(b.id)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-950/50"
                            title="Accept Booking"
                          >
                            <CheckCircle className="w-3 h-3" /> Accept
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Completed')}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 bg-slate-900 rounded-lg border border-slate-800"
                            title="Mark Completed"
                          >
                            ✔
                          </button>
                        )}

                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Cancelled')}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 bg-slate-900 rounded-lg border border-slate-800"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No bookings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN TECHNICIAN MODAL */}
      {assignModalBooking && (
        <Modal
          isOpen={!!assignModalBooking}
          onClose={() => setAssignModalBooking(null)}
          title={`Assign Technician to #${assignModalBooking.bookingNumber || assignModalBooking.id}`}
        >
          <form onSubmit={handleAssignEmployee} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select an available wash specialist to handle this service at {assignModalBooking.address?.area || 'location'}.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Available Technicians</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      selectedEmpId === emp.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={emp.photo} alt={emp.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-bold block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400">⭐ {emp.rating} • {emp.completedJobs} Jobs</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      emp.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAssignModalBooking(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" icon={UserCheck}>Confirm Assignment</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details #${selectedBooking.bookingNumber || selectedBooking.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block font-semibold">SERVICE & VEHICLE</span>
              <p className="font-bold text-slate-100 text-sm">{selectedBooking.service?.name}</p>
              <p className="text-slate-300">
                {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model} • {selectedBooking.vehicle?.regNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-semibold">SCHEDULE</span>
                <p className="font-bold text-slate-200">{selectedBooking.date}</p>
                <p className="text-slate-400">{selectedBooking.timeSlot}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-semibold">BILLING</span>
                <p className="font-bold text-emerald-400 text-sm">₹{selectedBooking.finalAmount}</p>
                <p className="text-slate-400">{selectedBooking.paymentMethod}</p>
              </div>
            </div>

            {selectedBooking.address && (
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-semibold">SERVICE LOCATION</span>
                <p className="font-bold text-slate-200">{selectedBooking.address.house}, {selectedBooking.address.street}</p>
                <p className="text-slate-400">{selectedBooking.address.area}, {selectedBooking.address.city} - {selectedBooking.address.pincode}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
