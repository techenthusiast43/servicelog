import React from 'react';
import { ShieldCheck, ExternalLink, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-850 bg-[#07090E] text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">ServiceLog</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Decentralized proof-of-service protocol on BOT Chain. Empowering businesses and service
              providers to commit tamper-proof milestones with customer verification.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              BOT Chain Testnet
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chain ID: 968 (0x3c8)</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <a
                  href="https://rpc.bohr.life"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition"
                >
                  RPC: https://rpc.bohr.life
                </a>
              </li>
              <li>
                <span className="text-slate-500">Native Token:</span> BOT (18 Decimals)
              </li>
              <li>
                <span className="text-slate-500">Total Supply:</span> 150 Million BOT
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Resources & Explorer
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://scan.bohr.life/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  BOT Chain Testnet Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://scan.botchain.ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  BOT Chain Mainnet Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-emerald-400/90 font-medium">100% Non-Custodial & Verified</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ServiceLog. Built for the BOT Chain Ecosystem.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Public Smart Contract
            </span>
            <span>Zero Off-Chain PII</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

