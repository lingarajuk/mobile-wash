import React, { useState } from 'react';
import { INITIAL_BUSINESS_SETTINGS } from '@shared/data/mockData';
import { useToast } from '@shared/context/ToastContext';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { Settings, Save, Building } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(INITIAL_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast('Business settings updated successfully!', 'success');
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-[#10213F]">Business Settings</h1>
        <p className="text-xs text-[#64748B]">Configure company branding, operating hours and tax policies</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Brand Name"
            value={settings.businessName}
            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
            required
          />

          <Input
            label="Tagline"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            required
          />

          <Input
            label="Support Phone"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            required
          />

          <Input
            label="Support Email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            required
          />

          <Input
            label="Opening Time Slot"
            value={settings.openingTime}
            onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
          />

          <Input
            label="Closing Time Slot"
            value={settings.closingTime}
            onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
          />

          <Input
            label="Eco Tax Percentage (%)"
            type="number"
            value={settings.taxPercentage}
            onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#334155] block mb-1">Business Headquarter Address</label>
          <textarea
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            rows={2}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#334155] block mb-1">Active Service Areas (Comma Separated)</label>
          <textarea
            value={settings.serviceAreas}
            onChange={(e) => setSettings({ ...settings, serviceAreas: e.target.value })}
            rows={2}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#334155] block mb-1">Cancellation & Refund Policy</label>
          <textarea
            value={settings.cancellationRules}
            onChange={(e) => setSettings({ ...settings, cancellationRules: e.target.value })}
            rows={2}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="pt-4 border-t border-[#E6ECF5] flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} icon={Save} className="shadow-lg shadow-cyan-500/25">
            Save Business Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
