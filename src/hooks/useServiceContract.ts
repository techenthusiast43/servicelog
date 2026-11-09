import { useState, useCallback } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { SERVICELOG_ABI, CONTRACT_ADDRESS_TESTNET } from '../contracts/abi';
import { ServiceRecord, ServiceStatus } from '../types/service';
import { DEFAULT_CHAIN } from '../config/chains';

export function useServiceContract() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const contractAddress = CONTRACT_ADDRESS_TESTNET;

  const { writeContractAsync } = useWriteContract();
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);

  // Wait for tx confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  });

  const clearTxState = useCallback(() => {
    setCurrentTxHash(undefined);
    setActionError(null);
  }, []);

  /**
   * Create a new service record on-chain
   */
  const createService = async (
    serviceId: `0x${string}`,
    customer: `0x${string}`,
    title: string,
    description: string
  ): Promise<`0x${string}`> => {
    setActionError(null);
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: SERVICELOG_ABI,
        functionName: 'createService',
        args: [serviceId, customer, title, description],
      });
      setCurrentTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('Error creating service:', err);
      const msg = err.shortMessage || err.message || 'Failed to submit transaction';
      setActionError(msg);
      throw err;
    }
  };

  /**
   * Complete an existing pending service record
   */
  const completeService = async (serviceId: `0x${string}`): Promise<`0x${string}`> => {
    setActionError(null);
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: SERVICELOG_ABI,
        functionName: 'completeService',
        args: [serviceId],
      });
      setCurrentTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('Error completing service:', err);
      const msg = err.shortMessage || err.message || 'Failed to complete service';
      setActionError(msg);
      throw err;
    }
  };

  /**
   * Cancel an existing pending service record
   */
  const cancelService = async (serviceId: `0x${string}`): Promise<`0x${string}`> => {
    setActionError(null);
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: SERVICELOG_ABI,
        functionName: 'cancelService',
        args: [serviceId],
      });
      setCurrentTxHash(hash);
      return hash;
    } catch (err: any) {
      console.error('Error cancelling service:', err);
      const msg = err.shortMessage || err.message || 'Failed to cancel service';
      setActionError(msg);
      throw err;
    }
  };

  /**
   * Fetch a single service by ID directly (can be called by anyone without wallet connect)
   */
  const fetchServiceById = useCallback(
    async (serviceId: `0x${string}`): Promise<ServiceRecord | null> => {
      if (!publicClient) return null;
      try {
        const raw = (await publicClient.readContract({
          address: contractAddress,
          abi: SERVICELOG_ABI,
          functionName: 'getService',
          args: [serviceId],
        })) as any;

        return {
          serviceId,
          provider: raw.provider,
          status: Number(raw.status) as ServiceStatus,
          customer: raw.customer,
          createdAt: Number(raw.createdAt),
          completedAt: Number(raw.completedAt),
          title: raw.title,
          description: raw.description,
        };
      } catch (err) {
        console.warn('Service not found or error reading record:', err);
        return null;
      }
    },
    [publicClient, contractAddress]
  );

  /**
   * Fetch services created by connected wallet
   */
  const fetchProviderServices = useCallback(async (): Promise<ServiceRecord[]> => {
    if (!publicClient || !address) return [];
    try {
      const ids = (await publicClient.readContract({
        address: contractAddress,
        abi: SERVICELOG_ABI,
        functionName: 'getMyServices',
        account: address,
      })) as `0x${string}`[];

      const records: ServiceRecord[] = [];
      for (const id of ids) {
        const record = await fetchServiceById(id);
        if (record) records.push(record);
      }
      return records;
    } catch (err) {
      console.error('Error fetching provider services:', err);
      return [];
    }
  }, [publicClient, address, contractAddress, fetchServiceById]);

  /**
   * Fetch services where wallet is customer
   */
  const fetchCustomerServices = useCallback(async (): Promise<ServiceRecord[]> => {
    if (!publicClient || !address) return [];
    try {
      const ids = (await publicClient.readContract({
        address: contractAddress,
        abi: SERVICELOG_ABI,
        functionName: 'getCustomerServices',
        args: [address],
      })) as `0x${string}`[];

      const records: ServiceRecord[] = [];
      for (const id of ids) {
        const record = await fetchServiceById(id);
        if (record) records.push(record);
      }
      return records;
    } catch (err) {
      console.error('Error fetching customer services:', err);
      return [];
    }
  }, [publicClient, address, contractAddress, fetchServiceById]);

  /**
   * Fetch global overview / all services
   */
  const fetchAllServices = useCallback(
    async (offset = 0, limit = 20): Promise<{ records: ServiceRecord[]; total: number }> => {
      if (!publicClient) return { records: [], total: 0 };
      try {
        const res = (await publicClient.readContract({
          address: contractAddress,
          abi: SERVICELOG_ABI,
          functionName: 'getAllServiceIds',
          args: [BigInt(offset), BigInt(limit)],
        })) as [`0x${string}`[], bigint];

        const ids = res[0];
        const total = Number(res[1]);

        const records: ServiceRecord[] = [];
        for (const id of ids) {
          const record = await fetchServiceById(id);
          if (record) records.push(record);
        }
        return { records, total };
      } catch (err) {
        console.error('Error fetching all services:', err);
        return { records: [], total: 0 };
      }
    },
    [publicClient, contractAddress, fetchServiceById]
  );

  return {
    contractAddress,
    isConnected,
    userAddress: address,
    createService,
    completeService,
    cancelService,
    fetchServiceById,
    fetchProviderServices,
    fetchCustomerServices,
    fetchAllServices,
    currentTxHash,
    isConfirming,
    isConfirmed,
    receipt,
    actionError,
    clearTxState,
  };
}

