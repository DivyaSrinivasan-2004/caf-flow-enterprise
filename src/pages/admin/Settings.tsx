import { Building2, Receipt, CreditCard, Users, Shield } from 'lucide-react';

const settingSections = [
  { icon: <Building2 className="w-5 h-5" />, title: 'Company Profile', desc: 'Business name, address, contact details' },
  { icon: <Receipt className="w-5 h-5" />, title: 'Tax & GST', desc: 'Tax rates, GST number, tax configuration' },
  { icon: <CreditCard className="w-5 h-5" />, title: 'Payment Gateways', desc: 'Card, UPI, wallet integrations' },
  { icon: <Users className="w-5 h-5" />, title: 'User Roles & Permissions', desc: 'Access control matrix for all roles' },
  { icon: <Shield className="w-5 h-5" />, title: 'Invoice Settings', desc: 'Numbering format, templates, terms' },
];

const roles = ['Admin', 'Manager', 'Accountant', 'Staff'];
const perms = ['Dashboard', 'Invoices', 'Products', 'Customers', 'Payments', 'Reports', 'Inventory', 'Settings'];
const matrix: Record<string, string[]> = {
  Admin: perms,
  Manager: ['Dashboard', 'Invoices', 'Products', 'Customers', 'Payments', 'Reports', 'Inventory'],
  Accountant: ['Dashboard', 'Invoices', 'Payments', 'Reports'],
  Staff: ['Dashboard'],
};

const Settings = () => (
  <div className="space-y-[24px] animate-fade-in">
    <h1 className="text-2xl font-bold text-foreground">Settings</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
      {settingSections.map(s => (
        <button key={s.title} className="bg-card rounded-lg border border-border shadow-soft hover:shadow-card-hover transition-all p-[24px] text-left flex items-start gap-[16px] group">
          <div className="p-[12px] rounded-md bg-accent text-accent-foreground group-hover:gradient-primary group-hover:text-primary-foreground transition-all">{s.icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-[4px]">{s.desc}</p>
          </div>
        </button>
      ))}
    </div>

    {/* Permission Matrix */}
    <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
      <div className="px-[24px] py-[16px] border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Permission Matrix</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-secondary/50">
            <th className="text-left px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">Module</th>
            {roles.map(r => <th key={r} className="text-center px-[24px] py-[12px] text-xs font-semibold text-muted-foreground uppercase">{r}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {perms.map(p => (
              <tr key={p} className="hover:bg-accent/30">
                <td className="px-[24px] py-[12px] text-sm font-medium text-foreground">{p}</td>
                {roles.map(r => (
                  <td key={r} className="text-center px-[24px] py-[12px]">
                    <span className={`inline-block w-5 h-5 rounded-full ${matrix[r].includes(p) ? 'bg-success' : 'bg-muted'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Settings;
