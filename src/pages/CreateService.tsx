import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { isAddress } from 'viem';
import {
  PlusCircle,
  Sparkles,
  RefreshCw,
  Wallet,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { useServiceContract } from '../hooks/useServiceContract';
import { generateUniqueServiceId, isValidBytes32 } from '../utils/serviceId';
import { TransactionModal } from '../components/TransactionModal';

interface CreateServiceProps {
  onSuccess: (serviceId: string) => void;
}

export const CreateService: React.FC<CreateServiceProps> = ({ onSuccess }) => {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const {
    createService,
    currentTxHash,
    isConfirming,
    isConfirmed,
    actionError,
    clearTxState,
  } = useServiceContract();

  const [serviceId, setServiceId] = useState<`0x${string}`>(() => generateUniqueServiceId());
  const [customerAddress, setCustomerAddress] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Generate new unique ID
  const handleRegenerateId = () => {
    setServiceId(generateUniqueServiceId());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isConnected || !address) {
      setFormError('Please connect your wallet first.');
      return;
    }

    if (!isValidBytes32(serviceId)) {
      setFormError('Invalid Service ID format. Must be a valid 32-byte hex hash.');
      return;
    }

    if (!isAddress(customerAddress)) {
      setFormError('Invalid customer wallet address. Must be a valid Ethereum/BOT format.');
      return;
    }

    if (customerAddress.toLowerCase() === address.toLowerCase()) {
      setFormError('Provider and Customer cannot be the same address.');
      return;
    }

    if (!title.trim()) {
      setFormError('Service title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setShowModal(true);
      await createService(
        serviceId,
        customerAddress as `0x${string}`,
        title.trim(),
        description.trim() || 'No additional metadata'
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isConfirmed) {
      onSuccess(serviceId);
      // Reset form
      setServiceId(generateUniqueServiceId());
      setCustomerAddress('');
      setTitle('');
      setDescription('');
      clearTxState();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-400" />
          Create Service Record
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Mint an immutable service agreement milestone directly on the BOT Chain network.
        </p>
      </div>

      {/* Wallet Guard */}
      {!isConnected ? (
        <div className="rounded-2xl border border-slate-800 bg-[#111622] p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Wallet className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Wallet Connection Required</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You must connect your Web3 wallet to sign and broadcast the service creation transaction
              to BOT Chain.
            </p>
          </div>
          <button
            onClick={() => open()}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#111622] p-6 sm:p-8 space-y-6 shadow-xl">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Generated Service ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                Service ID (bytes32 Identifier)
              </label>
              <button
                type="button"
                onClick={handleRegenerateId}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Generate New ID
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={serviceId}
                className="w-full rounded-xl bg-[#0A0D14] border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-emerald-300 select-all focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Cryptographically unique hash generated for on-chain deduplication and indexing.
            </p>
          </div>

          {/* Customer Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Customer Wallet Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full rounded-xl bg-[#0A0D14] border border-slate-800 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition"
            />
            <p className="text-[11px] text-slate-500">
              The recipient address that will be authorized to view and verify this service.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Service Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Smart Contract Security Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-[#0A0D14] border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Short Description / Off-Chain Reference
              </label>
              <span className="text-[10px] text-slate-500">Gas optimized</span>
            </div>
            <textarea
              rows={3}
              placeholder="Brief summary, milestone deliverables, or IPFS hash of documentation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-[#0A0D14] border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition"
            />
            <p className="text-[11px] text-slate-500">
              Keep long sensitive personal information off-chain to maintain privacy and gas efficiency.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || isConfirming}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting || isConfirming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Broadcasting to BOT Chain...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Record Service on BOT Chain
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Transaction Lifecycle Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={handleModalClose}
        txHash={currentTxHash}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={actionError}
        actionTitle="Service Creation"
        serviceId={serviceId}
      />
    </div>
  );
};

