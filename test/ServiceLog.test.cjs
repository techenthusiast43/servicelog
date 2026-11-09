const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ServiceLog Contract", function () {
  let serviceLog;
  let provider, customer, otherAccount;

  // Helper to create a bytes32 ID
  const createId = (str) => ethers.keccak256(ethers.toUtf8Bytes(str));

  beforeEach(async function () {
    [provider, customer, otherAccount] = await ethers.getSigners();

    const ServiceLogFactory = await ethers.getContractFactory("ServiceLog");
    serviceLog = await ServiceLogFactory.deploy();
    await serviceLog.waitForDeployment();
  });

  describe("Service Creation", function () {
    it("should successfully create a new service and emit ServiceCreated", async function () {
      const serviceId = createId("service-1");
      const title = "Smart Contract Audit";
      const desc = "Comprehensive security review of ERC20 and Vault";

      const tx = await serviceLog
        .connect(provider)
        .createService(serviceId, customer.address, title, desc);

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Verify emitted event
      await expect(tx)
        .to.emit(serviceLog, "ServiceCreated")
        .withArgs(
          serviceId,
          provider.address,
          customer.address,
          title,
          desc,
          (val) => val > 0
        );

      // Verify retrieved service record
      const record = await serviceLog.getService(serviceId);
      expect(record.provider).to.equal(provider.address);
      expect(record.customer).to.equal(customer.address);
      expect(record.status).to.equal(1); // Pending
      expect(record.title).to.equal(title);
      expect(record.description).to.equal(desc);
      expect(record.createdAt).to.be.gt(0);
      expect(record.completedAt).to.equal(0);
    });

    it("should reject creation with empty/zero bytes32 service ID", async function () {
      await expect(
        serviceLog
          .connect(provider)
          .createService(ethers.ZeroHash, customer.address, "Title", "Desc")
      ).to.be.revertedWithCustomError(serviceLog, "InvalidServiceId");
    });

    it("should prevent duplicate service IDs", async function () {
      const serviceId = createId("duplicate-id");
      await serviceLog
        .connect(provider)
        .createService(serviceId, customer.address, "First", "Desc");

      await expect(
        serviceLog
          .connect(provider)
          .createService(serviceId, otherAccount.address, "Second", "Desc")
      )
        .to.be.revertedWithCustomError(serviceLog, "ServiceAlreadyExists")
        .withArgs(serviceId);
    });

    it("should reject invalid customer address (address(0))", async function () {
      const serviceId = createId("zero-address-cust");
      await expect(
        serviceLog
          .connect(provider)
          .createService(serviceId, ethers.ZeroAddress, "Title", "Desc")
      ).to.be.revertedWithCustomError(serviceLog, "InvalidCustomerAddress");
    });

    it("should reject when caller sets themselves as customer", async function () {
      const serviceId = createId("self-customer");
      await expect(
        serviceLog
          .connect(provider)
          .createService(serviceId, provider.address, "Title", "Desc")
      ).to.be.revertedWithCustomError(serviceLog, "CustomerCannotBeProvider");
    });

    it("should reject empty titles", async function () {
      const serviceId = createId("empty-title");
      await expect(
        serviceLog
          .connect(provider)
          .createService(serviceId, customer.address, "", "Desc")
      ).to.be.revertedWithCustomError(serviceLog, "EmptyTitle");
    });
  });

  describe("Service Completion", function () {
    let serviceId;

    beforeEach(async function () {
      serviceId = createId("completion-test");
      await serviceLog
        .connect(provider)
        .createService(serviceId, customer.address, "Web Dev", "Fullstack dApp");
    });

    it("should allow provider to complete a pending service", async function () {
      const tx = await serviceLog.connect(provider).completeService(serviceId);
      await expect(tx)
        .to.emit(serviceLog, "ServiceCompleted")
        .withArgs(serviceId, provider.address, (val) => val > 0);

      const record = await serviceLog.getService(serviceId);
      expect(record.status).to.equal(2); // Completed
      expect(record.completedAt).to.be.gt(0);
    });

    it("should reject completion attempt from unauthorized accounts", async function () {
      await expect(
        serviceLog.connect(otherAccount).completeService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "UnauthorizedCaller")
        .withArgs(otherAccount.address, provider.address);

      await expect(
        serviceLog.connect(customer).completeService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "UnauthorizedCaller")
        .withArgs(customer.address, provider.address);
    });

    it("should revert if service does not exist", async function () {
      const nonExistent = createId("ghost-service");
      await expect(
        serviceLog.connect(provider).completeService(nonExistent)
      )
        .to.be.revertedWithCustomError(serviceLog, "ServiceNotFound")
        .withArgs(nonExistent);
    });

    it("should revert if attempting to re-complete an already completed service", async function () {
      await serviceLog.connect(provider).completeService(serviceId);

      await expect(
        serviceLog.connect(provider).completeService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "InvalidStatusTransition")
        .withArgs(2, 2); // Current: Completed, Target: Completed
    });

    it("should revert if attempting to complete a cancelled service", async function () {
      await serviceLog.connect(provider).cancelService(serviceId);

      await expect(
        serviceLog.connect(provider).completeService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "InvalidStatusTransition")
        .withArgs(3, 2); // Current: Cancelled, Target: Completed
    });
  });

  describe("Service Cancellation", function () {
    let serviceId;

    beforeEach(async function () {
      serviceId = createId("cancellation-test");
      await serviceLog
        .connect(provider)
        .createService(serviceId, customer.address, "Maintenance", "Quarterly check");
    });

    it("should allow provider to cancel a pending service", async function () {
      const tx = await serviceLog.connect(provider).cancelService(serviceId);
      await expect(tx)
        .to.emit(serviceLog, "ServiceCancelled")
        .withArgs(serviceId, provider.address, (val) => val > 0);

      const record = await serviceLog.getService(serviceId);
      expect(record.status).to.equal(3); // Cancelled
    });

    it("should reject cancellation attempt by non-provider", async function () {
      await expect(
        serviceLog.connect(otherAccount).cancelService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "UnauthorizedCaller")
        .withArgs(otherAccount.address, provider.address);
    });

    it("should revert if attempting to cancel an already completed service", async function () {
      await serviceLog.connect(provider).completeService(serviceId);

      await expect(
        serviceLog.connect(provider).cancelService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "InvalidStatusTransition")
        .withArgs(2, 3); // Current: Completed, Target: Cancelled
    });

    it("should revert if attempting to re-cancel an already cancelled service", async function () {
      await serviceLog.connect(provider).cancelService(serviceId);

      await expect(
        serviceLog.connect(provider).cancelService(serviceId)
      )
        .to.be.revertedWithCustomError(serviceLog, "InvalidStatusTransition")
        .withArgs(3, 3); // Current: Cancelled, Target: Cancelled
    });
  });

  describe("Queries and Pagination", function () {
    it("should track provider services and customer services correctly", async function () {
      const id1 = createId("query-1");
      const id2 = createId("query-2");

      await serviceLog
        .connect(provider)
        .createService(id1, customer.address, "Job 1", "D1");
      await serviceLog
        .connect(provider)
        .createService(id2, otherAccount.address, "Job 2", "D2");

      const providerServices = await serviceLog.connect(provider).getMyServices();
      expect(providerServices.length).to.equal(2);
      expect(providerServices[0]).to.equal(id1);
      expect(providerServices[1]).to.equal(id2);

      const customer1Services = await serviceLog.getCustomerServices(customer.address);
      expect(customer1Services.length).to.equal(1);
      expect(customer1Services[0]).to.equal(id1);

      const customer2Services = await serviceLog.getCustomerServices(otherAccount.address);
      expect(customer2Services.length).to.equal(1);
      expect(customer2Services[0]).to.equal(id2);
    });

    it("should paginate all service IDs properly", async function () {
      const id1 = createId("page-1");
      const id2 = createId("page-2");
      const id3 = createId("page-3");

      await serviceLog.connect(provider).createService(id1, customer.address, "P1", "D1");
      await serviceLog.connect(provider).createService(id2, customer.address, "P2", "D2");
      await serviceLog.connect(provider).createService(id3, customer.address, "P3", "D3");

      expect(await serviceLog.getTotalServicesCount()).to.equal(3);

      const [page1, total] = await serviceLog.getAllServiceIds(0, 2);
      expect(total).to.equal(3);
      expect(page1.length).to.equal(2);
      expect(page1[0]).to.equal(id1);
      expect(page1[1]).to.equal(id2);

      const [page2] = await serviceLog.getAllServiceIds(2, 2);
      expect(page2.length).to.equal(1);
      expect(page2[0]).to.equal(id3);
    });
  });
});

