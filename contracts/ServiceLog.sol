// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ServiceLog
 * @dev Decentralized service record management system on BOT Chain.
 * Allows providers to record service milestones and customers to view verified history.
 */
contract ServiceLog {
    enum ServiceStatus {
        None,       // 0: Non-existent
        Pending,    // 1: Created and in progress
        Completed,  // 2: Successfully finalized
        Cancelled   // 3: Cancelled by provider
    }

    struct ServiceRecord {
        address provider;      // Slot 0: 20 bytes
        ServiceStatus status;  // Slot 0: 1 byte (21/32 bytes used)
        address customer;      // Slot 1: 20 bytes
        uint48 createdAt;      // Slot 1: 6 bytes
        uint48 completedAt;    // Slot 1: 6 bytes (32/32 bytes packed)
        string title;          // Slot 2: dynamic string
        string description;    // Slot 3: dynamic string (or off-chain hash/URI)
    }

    // Mapping from unique service ID to ServiceRecord
    mapping(bytes32 => ServiceRecord) private _services;

    // Track all registered service IDs
    bytes32[] private _allServiceIds;

    // Mapping from provider address to their created service IDs
    mapping(address => bytes32[]) private _providerServices;

    // Mapping from customer address to their received service IDs
    mapping(address => bytes32[]) private _customerServices;

    // Custom errors for gas efficiency
    error ServiceAlreadyExists(bytes32 serviceId);
    error ServiceNotFound(bytes32 serviceId);
    error InvalidServiceId();
    error InvalidCustomerAddress();
    error CustomerCannotBeProvider();
    error EmptyTitle();
    error UnauthorizedCaller(address caller, address expectedProvider);
    error InvalidStatusTransition(ServiceStatus currentStatus, ServiceStatus targetStatus);

    // Events
    event ServiceCreated(
        bytes32 indexed serviceId,
        address indexed provider,
        address indexed customer,
        string title,
        string description,
        uint48 createdAt
    );

    event ServiceCompleted(
        bytes32 indexed serviceId,
        address indexed provider,
        uint48 completedAt
    );

    event ServiceCancelled(
        bytes32 indexed serviceId,
        address indexed provider,
        uint48 cancelledAt
    );

    /**
     * @notice Creates a new service record on-chain.
     * @param serviceId Unique identifier (bytes32) for the service.
     * @param customer Wallet address of the service recipient.
     * @param title Title of the service.
     * @param description Brief description or off-chain IPFS hash.
     */
    function createService(
        bytes32 serviceId,
        address customer,
        string calldata title,
        string calldata description
    ) external {
        if (serviceId == bytes32(0)) revert InvalidServiceId();
        if (_services[serviceId].status != ServiceStatus.None) {
            revert ServiceAlreadyExists(serviceId);
        }
        if (customer == address(0)) revert InvalidCustomerAddress();
        if (customer == msg.sender) revert CustomerCannotBeProvider();
        if (bytes(title).length == 0) revert EmptyTitle();

        uint48 currentTime = uint48(block.timestamp);

        _services[serviceId] = ServiceRecord({
            provider: msg.sender,
            status: ServiceStatus.Pending,
            customer: customer,
            createdAt: currentTime,
            completedAt: 0,
            title: title,
            description: description
        });

        _allServiceIds.push(serviceId);
        _providerServices[msg.sender].push(serviceId);
        _customerServices[customer].push(serviceId);

        emit ServiceCreated(
            serviceId,
            msg.sender,
            customer,
            title,
            description,
            currentTime
        );
    }

    /**
     * @notice Marks a pending service as completed.
     * @dev Only the provider who created the service can complete it.
     * Completed or cancelled services cannot be completed.
     * @param serviceId The unique service ID.
     */
    function completeService(bytes32 serviceId) external {
        ServiceRecord storage record = _services[serviceId];

        if (record.status == ServiceStatus.None) revert ServiceNotFound(serviceId);
        if (record.provider != msg.sender) {
            revert UnauthorizedCaller(msg.sender, record.provider);
        }
        if (record.status != ServiceStatus.Pending) {
            revert InvalidStatusTransition(record.status, ServiceStatus.Completed);
        }

        uint48 currentTime = uint48(block.timestamp);
        record.status = ServiceStatus.Completed;
        record.completedAt = currentTime;

        emit ServiceCompleted(serviceId, msg.sender, currentTime);
    }

    /**
     * @notice Cancels an unfinished pending service.
     * @dev Only the provider who created the service can cancel it.
     * Completed records cannot be cancelled.
     * @param serviceId The unique service ID.
     */
    function cancelService(bytes32 serviceId) external {
        ServiceRecord storage record = _services[serviceId];

        if (record.status == ServiceStatus.None) revert ServiceNotFound(serviceId);
        if (record.provider != msg.sender) {
            revert UnauthorizedCaller(msg.sender, record.provider);
        }
        if (record.status != ServiceStatus.Pending) {
            revert InvalidStatusTransition(record.status, ServiceStatus.Cancelled);
        }

        uint48 currentTime = uint48(block.timestamp);
        record.status = ServiceStatus.Cancelled;

        emit ServiceCancelled(serviceId, msg.sender, currentTime);
    }

    /**
     * @notice Retrieves the full record details of a service.
     * @param serviceId Unique service identifier.
     */
    function getService(bytes32 serviceId) external view returns (ServiceRecord memory) {
        ServiceRecord memory record = _services[serviceId];
        if (record.status == ServiceStatus.None) revert ServiceNotFound(serviceId);
        return record;
    }

    /**
     * @notice Retrieves all service IDs created by the caller (provider).
     */
    function getMyServices() external view returns (bytes32[] memory) {
        return _providerServices[msg.sender];
    }

    /**
     * @notice Retrieves all service IDs where `customer` is the recipient.
     * @param customer Customer wallet address.
     */
    function getCustomerServices(address customer) external view returns (bytes32[] memory) {
        return _customerServices[customer];
    }

    /**
     * @notice Returns total number of registered services.
     */
    function getTotalServicesCount() external view returns (uint256) {
        return _allServiceIds.length;
    }

    /**
     * @notice Returns a paginated slice of all service IDs.
     * Useful for global overview or explorer lookups on chains without eth_getLogs.
     */
    function getAllServiceIds(uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory ids, uint256 total)
    {
        total = _allServiceIds.length;
        if (offset >= total) {
            return (new bytes32[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 count = end - offset;
        ids = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = _allServiceIds[offset + i];
        }

        return (ids, total);
    }
}

