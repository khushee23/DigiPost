import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Send, ArrowRight, CheckCircle2, Calculator, Info, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parcelService } from '../../services/parcelService';
import { PARCEL_TYPES } from '../../constants/statusConstants';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/formatters';

export const BookParcelPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [sender, setSender] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: 'Fort Area, near General Post Office',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    email: user?.email || '',
  });

  const [receiver, setReceiver] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    email: '',
  });

  const [parcelDetails, setParcelDetails] = useState({
    parcelType: 'standard',
    weight: '1.0',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [createdParcel, setCreatedParcel] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Live estimate calculation
  const baseRates = {
    standard: 10,
    express: 22,
    document: 12,
    fragile: 25,
    heavy: 35,
  };
  const weightNum = Math.max(0.5, parseFloat(parcelDetails.weight) || 1);
  const estimatedCost = (baseRates[parcelDetails.parcelType] || 15) + weightNum * 4.5;
  const estimatedDays = parcelDetails.parcelType === 'express' ? '1-2 Days' : '3-5 Days';

  const handleSenderChange = (e) => {
    const { name, value } = e.target;
    setSender((prev) => ({ ...prev, [name]: value }));
  };

  const handleReceiverChange = (e) => {
    const { name, value } = e.target;
    setReceiver((prev) => ({ ...prev, [name]: value }));
  };

  const handleParcelChange = (e) => {
    const { name, value } = e.target;
    setParcelDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiver.name || !receiver.phone || !receiver.address || !receiver.city || !receiver.state) {
      error('Please complete all required receiver fields.');
      return;
    }

    if (weightNum <= 0) {
      error('Parcel weight must be a positive number.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        customerId: user._id,
        sender,
        receiver,
        parcelType: parcelDetails.parcelType,
        weight: weightNum,
        description: parcelDetails.description,
      };

      const res = await parcelService.bookParcel(payload);
      if (res.success) {
        setCreatedParcel(res.parcel);
        setIsSuccessModalOpen(true);
        success(`Parcel booked successfully! Tracking ID: ${res.trackingId}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to book parcel.';
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Book a New Parcel"
        subtitle="Complete the sender and recipient consignment details to generate a registered postal manifest."
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'Book Parcel' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. SENDER INFORMATION */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Sender Information</h3>
                  <p className="text-[11px] text-neutral-400">Origin details and contact address</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sender Full Name"
                  name="name"
                  value={sender.name}
                  onChange={handleSenderChange}
                  icon={User}
                  required
                />
                <Input
                  label="Sender Phone Number"
                  name="phone"
                  value={sender.phone}
                  onChange={handleSenderChange}
                  icon={Phone}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    name="address"
                    value={sender.address}
                    onChange={handleSenderChange}
                    icon={MapPin}
                    required
                  />
                </div>
                <Input
                  label="City"
                  name="city"
                  value={sender.city}
                  onChange={handleSenderChange}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="State"
                    name="state"
                    value={sender.state}
                    onChange={handleSenderChange}
                    required
                  />
                  <Input
                    label="PIN Code"
                    name="postalCode"
                    value={sender.postalCode}
                    onChange={handleSenderChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. RECEIVER INFORMATION */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Receiver / Destination Information</h3>
                  <p className="text-[11px] text-neutral-400">Recipient contact and delivery location</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient Full Name"
                  name="name"
                  placeholder="e.g. Asha Sharma"
                  value={receiver.name}
                  onChange={handleReceiverChange}
                  icon={User}
                  required
                />
                <Input
                  label="Recipient Phone Number"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={receiver.phone}
                  onChange={handleReceiverChange}
                  icon={Phone}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Recipient Street Address"
                    name="address"
                    placeholder="12 FC Road, near Deccan Gymkhana"
                    value={receiver.address}
                    onChange={handleReceiverChange}
                    icon={MapPin}
                    required
                  />
                </div>
                <Input
                  label="Destination City"
                  name="city"
                  placeholder="Pune"
                  value={receiver.city}
                  onChange={handleReceiverChange}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="State"
                    name="state"
                    placeholder="Maharashtra"
                    value={receiver.state}
                    onChange={handleReceiverChange}
                    required
                  />
                  <Input
                    label="PIN Code"
                    name="postalCode"
                    placeholder="411004"
                    value={receiver.postalCode}
                    onChange={handleReceiverChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Recipient Email (Optional notification)"
                    name="email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={receiver.email}
                    onChange={handleReceiverChange}
                  />
                </div>
              </div>
            </div>

            {/* 3. PARCEL CLASSIFICATION */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Parcel Specifications</h3>
                  <p className="text-[11px] text-neutral-400">Weight, classification, and package notes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Consignment Category"
                  name="parcelType"
                  value={parcelDetails.parcelType}
                  onChange={handleParcelChange}
                  options={PARCEL_TYPES}
                  required
                />

                <Input
                  label="Weight (in kg)"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="70"
                  value={parcelDetails.weight}
                  onChange={handleParcelChange}
                  required
                />

                <div className="sm:col-span-2">
                  <Textarea
                    label="Contents Description & Special Instructions"
                    name="description"
                    rows={3}
                    placeholder="e.g. Documents, clothing, books, or small electronics"
                    value={parcelDetails.description}
                    onChange={handleParcelChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm sticky top-24 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <Calculator className="w-5 h-5 text-[#D71920]" />
                <h3 className="text-sm font-bold text-neutral-900">Booking Summary</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Selected Category:</span>
                  <span className="font-semibold text-neutral-900 capitalize">{parcelDetails.parcelType}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Weight:</span>
                  <span className="font-semibold text-neutral-900">{weightNum.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Est. Delivery Window:</span>
                  <span className="font-semibold text-neutral-900">{estimatedDays}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Origin:</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[140px]">
                    {sender.city || 'Origin'}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Destination:</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[140px]">
                    {receiver.city || 'Destination'}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-neutral-900">Total Calculated Postage:</span>
                  <span className="text-xl font-extrabold text-[#D71920]">
                    {formatCurrency(estimatedCost)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>Standard rates include tracking manifest registration and postal courier liability protection.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={Send}
              >
                Confirm & Book Consignment
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate(`/customer/parcels/${createdParcel?.trackingId}`);
        }}
        title="Consignment Successfully Registered"
        maxWidth="max-w-md"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-neutral-900">Your Parcel is Booked!</h4>
          <p className="text-xs text-neutral-500 mt-1 mb-4 leading-relaxed">
            The parcel has been accepted into the postal sorting pipeline. Share or record this tracking number:
          </p>

          <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 font-mono text-lg font-bold text-[#D71920] select-all mb-6">
            {createdParcel?.trackingId}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => navigate(`/customer/parcels/${createdParcel?.trackingId}`)}
            >
              View Tracking Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsSuccessModalOpen(false);
                setReceiver({ name: '', phone: '', address: '', city: '', state: '', postalCode: '', email: '' });
              }}
            >
              Book Another Parcel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
