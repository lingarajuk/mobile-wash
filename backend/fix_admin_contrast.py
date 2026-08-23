import os

pages_to_clean = [
    'apps/admin/src/pages/AdminEmployeesPage.jsx',
    'apps/admin/src/pages/AdminCustomersPage.jsx',
    'apps/admin/src/pages/AdminServicesPage.jsx',
    'apps/admin/src/pages/AdminOffersPage.jsx',
    'apps/admin/src/pages/AdminPaymentsPage.jsx',
    'apps/admin/src/pages/AdminReportsPage.jsx',
    'apps/admin/src/pages/AdminSettingsPage.jsx'
]

for p in pages_to_clean:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()

        # Fix text-white on headings
        c = c.replace('text-2xl font-extrabold text-white', 'text-2xl font-black text-[#10213F]')
        c = c.replace('text-xl font-bold text-white', 'text-xl font-black text-[#10213F]')
        c = c.replace('text-lg font-bold text-white', 'text-lg font-black text-[#10213F]')
        c = c.replace('text-base font-bold text-white', 'text-base font-black text-[#10213F]')
        c = c.replace('text-sm font-bold text-white', 'text-sm font-black text-[#10213F]')
        c = c.replace('font-bold text-white', 'font-black text-[#10213F]')
        c = c.replace('font-extrabold text-white', 'font-black text-[#10213F]')
        c = c.replace('font-semibold text-white', 'font-bold text-[#10213F]')

        # Fix cyan texts on white
        c = c.replace('text-cyan-400', 'text-[#1264F5]')
        c = c.replace('text-cyan-300', 'text-[#1264F5]')
        c = c.replace('border-cyan-500/40', 'border-[#BFDBFE]')
        c = c.replace('bg-cyan-500/10', 'bg-[#F0F6FF]')
        c = c.replace('bg-cyan-500', 'bg-[#1264F5]')
        c = c.replace('hover:bg-cyan-400', 'hover:bg-[#0F52CC]')
        c = c.replace('text-slate-950', 'text-white')

        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)

print('Admin pages contrast fixed successfully!')
