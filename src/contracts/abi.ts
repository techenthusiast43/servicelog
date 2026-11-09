export const SERVICELOG_ABI = [
  {
    "type": "function",
    "name": "createService",
    "inputs": [
      { "name": "serviceId", "type": "bytes32" },
      { "name": "customer", "type": "address" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "completeService",
    "inputs": [
      { "name": "serviceId", "type": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelService",
    "inputs": [
      { "name": "serviceId", "type": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getService",
    "inputs": [
      { "name": "serviceId", "type": "bytes32" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "provider", "type": "address" },
          { "name": "status", "type": "uint8" },
          { "name": "customer", "type": "address" },
          { "name": "createdAt", "type": "uint48" },
          { "name": "completedAt", "type": "uint48" },
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMyServices",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCustomerServices",
    "inputs": [
      { "name": "customer", "type": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalServicesCount",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllServiceIds",
    "inputs": [
      { "name": "offset", "type": "uint256" },
      { "name": "limit", "type": "uint256" }
    ],
    "outputs": [
      { "name": "ids", "type": "bytes32[]" },
      { "name": "total", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ServiceCreated",
    "inputs": [
      { "name": "serviceId", "type": "bytes32", "indexed": true },
      { "name": "provider", "type": "address", "indexed": true },
      { "name": "customer", "type": "address", "indexed": true },
      { "name": "title", "type": "string", "indexed": false },
      { "name": "description", "type": "string", "indexed": false },
      { "name": "createdAt", "type": "uint48", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ServiceCompleted",
    "inputs": [
      { "name": "serviceId", "type": "bytes32", "indexed": true },
      { "name": "provider", "type": "address", "indexed": true },
      { "name": "completedAt", "type": "uint48", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ServiceCancelled",
    "inputs": [
      { "name": "serviceId", "type": "bytes32", "indexed": true },
      { "name": "provider", "type": "address", "indexed": true },
      { "name": "cancelledAt", "type": "uint48", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ServiceAlreadyExists",
    "inputs": [{ "name": "serviceId", "type": "bytes32" }]
  },
  {
    "type": "error",
    "name": "ServiceNotFound",
    "inputs": [{ "name": "serviceId", "type": "bytes32" }]
  },
  {
    "type": "error",
    "name": "InvalidServiceId",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidCustomerAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CustomerCannotBeProvider",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EmptyTitle",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedCaller",
    "inputs": [
      { "name": "caller", "type": "address" },
      { "name": "expectedProvider", "type": "address" }
    ]
  },
  {
    "type": "error",
    "name": "InvalidStatusTransition",
    "inputs": [
      { "name": "currentStatus", "type": "uint8" },
      { "name": "targetStatus", "type": "uint8" }
    ]
  }
] as const;

// Default testnet deployed address fallback or configured via .env
export const CONTRACT_ADDRESS_TESTNET =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  "0xcdB81839c408D06e13f46A10216b71DBE9b0D42d";

