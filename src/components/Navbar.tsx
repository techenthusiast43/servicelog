import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  FileText,
  PlusCircle,
  Briefcase,
  UserCheck,
  Search,
  Menu,
  X,
  Wallet,
  Activity,
  Layers,
} from 'lucide-react';
import { formatAddress } from '../utils/formatters';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, address, chain } = useAccount();
  const { open } = useAppKit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'create', label: 'Create Service', icon: PlusCircle },
    { id: 'provider', label: 'Provider Portal', icon: Briefcase },
    { id: 'customer', label: 'Customer View', icon: UserCheck },
    { id: 'verify', label: 'Verify Service', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0A0D14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
                <FileText className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  ServiceLog
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    dApp
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5">
                  BOT Chain Network
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111622]/60 p-1.5 rounded-xl border border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Network & Wallet Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* BOT Chain Testnet Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">BOT Testnet</span>
              <span className="text-slate-500 font-mono text-[11px]">#968</span>
            </div>

            {/* Wallet Connect Button */}
            {isConnected ? (
              <button
                onClick={() => open()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-emerald-400 transition"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{address ? formatAddress(address) : 'Connected'}</span>
              </button>
            ) : (
              <button
                onClick={() => open()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => open()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold"
            >
              {isConnected && address ? formatAddress(address) : 'Connect'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0e131d] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Network: BOT Chain Testnet (968)</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

