import { ServiceStatus } from '../types/service';

/**
 * Formats an Ethereum/BOT address into short form: 0x1234...5678
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formats a bytes32 service ID into short form: 0xabc1...ef89
 */
export function formatBytes32(bytes32: string, chars = 6): string {
  if (!bytes32 || bytes32.length < 16) return bytes32;
  return `${bytes32.slice(0, chars + 2)}...${bytes32.slice(-chars)}`;
}

/**
 * Formats an epoch timestamp (seconds) into a readable date string
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp || timestamp === 0) return '—';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns human-readable status metadata
 */
export function getStatusMeta(status: ServiceStatus) {
  switch (status) {
    case ServiceStatus.Pending:
      return {
        label: 'Pending',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case ServiceStatus.Completed:
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case ServiceStatus.Cancelled:
      return {
        label: 'Cancelled',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: 'Unknown',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400',
      };
  }
}

