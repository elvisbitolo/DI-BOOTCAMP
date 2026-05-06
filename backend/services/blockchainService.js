const Web3 = require('web3');
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.isInitialized = false;
    this.networkId = null;
  }

  // Initialize blockchain connection
  async initialize() {
    try {
      // Connect to blockchain (Ethereum, Polygon, or custom)
      this.web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com');
      
      // Get network ID
      this.networkId = await this.web3.eth.net.getId();
      console.log(`Connected to blockchain network: ${this.networkId}`);

      // Initialize contract
      await this.initializeContract();
      
      // Set up account
      await this.setupAccount();
      
      this.isInitialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  // Initialize smart contract
  async initializeContract() {
    try {
      // Smart contract ABI (simplified version)
      const contractABI = [
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "name": "orderId", "type": "string"},
            {"indexed": true, "name": "seller", "type": "address"},
            {"indexed": true, "name": "rider", "type": "address"},
            {"indexed": false, "name": "amount", "type": "uint256"}
          ],
          "name": "OrderCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "name": "orderId", "type": "string"},
            {"indexed": true, "name": "rider", "type": "address"},
            {"indexed": false, "name": "amount", "type": "uint256"}
          ],
          "name": "OrderAccepted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "name": "orderId", "type": "string"},
            {"indexed": true, "name": "seller", "type": "address"},
            {"indexed": true, "name": "rider", "type": "address"},
            {"indexed": false, "name": "amount", "type": "uint256"}
          ],
          "name": "PaymentReleased",
          "type": "event"
        },
        {
          "constant": true,
          "inputs": [{"name": "orderId", "type": "string"}],
          "name": "getOrderDetails",
          "outputs": [
            {"name": "seller", "type": "address"},
            {"name": "rider", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "status", "type": "uint8"},
            {"name": "createdAt", "type": "uint256"}
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {"name": "orderId", "type": "string"},
            {"name": "sellerAddress", "type": "address"},
            {"name": "riderAddress", "type": "address"},
            {"name": "amount", "type": "uint256"}
          ],
          "name": "createEscrowOrder",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {"name": "orderId", "type": "string"},
            {"name": "riderAddress", "type": "address"}
          ],
          "name": "acceptOrder",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {"name": "orderId", "type": "string"},
            {"name": "delivered", "type": "bool"}
          ],
          "name": "confirmDelivery",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {"name": "orderId", "type": "string"}
          ],
          "name": "disputeOrder",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {"name": "orderId", "type": "string"},
            {"name": "winner", "type": "address"}
          ],
          "name": "resolveDispute",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      // Contract address (deployed on Polygon)
      const contractAddress = process.env.DELIVERY_CONTRACT_ADDRESS;
      
      if (contractAddress) {
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
        console.log(`Smart contract loaded at ${contractAddress}`);
      } else {
        console.log('Contract address not provided, using mock contract');
        this.createMockContract(contractABI);
      }
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }

  // Create mock contract for development
  createMockContract(abi) {
    this.contract = {
      methods: {
        createEscrowOrder: (orderId, sellerAddress, riderAddress, amount) => ({
          send: async (options) => {
            console.log('Mock: Creating escrow order', { orderId, sellerAddress, riderAddress, amount });
            return { transactionHash: '0x' + crypto.randomBytes(32).toString('hex') };
          }
        }),
        acceptOrder: (orderId, riderAddress) => ({
          send: async (options) => {
            console.log('Mock: Accepting order', { orderId, riderAddress });
            return { transactionHash: '0x' + crypto.randomBytes(32).toString('hex') };
          }
        }),
        confirmDelivery: (orderId, delivered) => ({
          send: async (options) => {
            console.log('Mock: Confirming delivery', { orderId, delivered });
            return { transactionHash: '0x' + crypto.randomBytes(32).toString('hex') };
          }
        }),
        getOrderDetails: (orderId) => ({
          call: async () => {
            return {
              seller: '0x' + crypto.randomBytes(20).toString('hex'),
              rider: '0x' + crypto.randomBytes(20).toString('hex'),
              amount: this.web3.utils.toWei('1', 'ether'),
              status: 1, // Pending
              createdAt: Date.now()
            };
          }
        })
      },
      events: {
        OrderCreated: {
          getPast: async (options) => []
        },
        OrderAccepted: {
          getPast: async (options) => []
        },
        PaymentReleased: {
          getPast: async (options) => []
        }
      }
    };
  }

  // Setup blockchain account
  async setupAccount() {
    try {
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      
      if (privateKey) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.web3.eth.accounts.wallet.add(this.account);
        console.log(`Blockchain account set up: ${this.account.address}`);
      } else {
        // Create a new account for development
        this.account = this.web3.eth.accounts.create();
        console.log(`New blockchain account created: ${this.account.address}`);
      }
    } catch (error) {
      console.error('Error setting up account:', error);
      throw error;
    }
  }

  // Create escrow order on blockchain
  async createEscrowOrder(orderData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const { orderId, sellerAddress, riderAddress, amount } = orderData;
      
      // Convert amount to wei
      const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      // Create transaction
      const transaction = this.contract.methods.createEscrowOrder(
        orderId,
        sellerAddress,
        riderAddress,
        amountInWei
      );

      // Estimate gas
      const gas = await transaction.estimateGas({ from: this.account.address });
      
      // Send transaction
      const receipt = await transaction.send({
        from: this.account.address,
        gas: gas,
        gasPrice: await this.web3.eth.getGasPrice()
      });

      console.log(`Escrow order created: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    } catch (error) {
      console.error('Error creating escrow order:', error);
      throw error;
    }
  }

  // Accept order on blockchain
  async acceptOrder(orderId, riderAddress) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const transaction = this.contract.methods.acceptOrder(orderId, riderAddress);
      
      const gas = await transaction.estimateGas({ from: this.account.address });
      
      const receipt = await transaction.send({
        from: this.account.address,
        gas: gas,
        gasPrice: await this.web3.eth.getGasPrice()
      });

      console.log(`Order accepted: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  // Confirm delivery on blockchain
  async confirmDelivery(orderId, delivered = true) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const transaction = this.contract.methods.confirmDelivery(orderId, delivered);
      
      const gas = await transaction.estimateGas({ from: this.account.address });
      
      const receipt = await transaction.send({
        from: this.account.address,
        gas: gas,
        gasPrice: await this.web3.eth.getGasPrice()
      });

      console.log(`Delivery confirmed: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  }

  // Get order details from blockchain
  async getOrderDetails(orderId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const details = await this.contract.methods.getOrderDetails(orderId).call();
      
      return {
        seller: details.seller,
        rider: details.rider,
        amount: this.web3.utils.fromWei(details.amount, 'ether'),
        status: details.status,
        createdAt: new Date(details.createdAt * 1000)
      };
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        logs: receipt.logs
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(address = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const accountAddress = address || this.account.address;
      const balance = await this.web3.eth.getBalance(accountAddress);
      
      return {
        address: accountAddress,
        balance: this.web3.utils.fromWei(balance, 'ether'),
        balanceWei: balance
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  // Monitor blockchain events
  async monitorEvents(callback) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Monitor OrderCreated events
      this.contract.events.OrderCreated({
        fromBlock: 'latest'
      })
      .on('data', (event) => {
        callback({
          type: 'OrderCreated',
          data: event.returnValues,
          blockNumber: event.blockNumber
        });
      })
      .on('error', (error) => {
        console.error('Error in OrderCreated event:', error);
      });

      // Monitor OrderAccepted events
      this.contract.events.OrderAccepted({
        fromBlock: 'latest'
      })
      .on('data', (event) => {
        callback({
          type: 'OrderAccepted',
          data: event.returnValues,
          blockNumber: event.blockNumber
        });
      })
      .on('error', (error) => {
        console.error('Error in OrderAccepted event:', error);
      });

      // Monitor PaymentReleased events
      this.contract.events.PaymentReleased({
        fromBlock: 'latest'
      })
      .on('data', (event) => {
        callback({
          type: 'PaymentReleased',
          data: event.returnValues,
          blockNumber: event.blockNumber
        });
      })
      .on('error', (error) => {
        console.error('Error in PaymentReleased event:', error);
      });

      console.log('Blockchain event monitoring started');
    } catch (error) {
      console.error('Error monitoring events:', error);
      throw error;
    }
  }

  // Generate blockchain certificate for delivery
  async generateDeliveryCertificate(orderData) {
    try {
      const certificateData = {
        orderId: orderData.orderId,
        seller: orderData.sellerAddress,
        rider: orderData.riderAddress,
        amount: orderData.amount,
        deliveryTime: orderData.deliveryTime,
        timestamp: Date.now(),
        hash: this.generateCertificateHash(orderData)
      };

      // Create digital signature
      const signature = this.web3.eth.accounts.sign(
        certificateData.hash,
        this.account.privateKey
      );

      return {
        certificate: certificateData,
        signature: signature.signature,
        verified: this.verifyCertificate(certificateData, signature.signature)
      };
    } catch (error) {
      console.error('Error generating delivery certificate:', error);
      throw error;
    }
  }

  // Generate certificate hash
  generateCertificateHash(data) {
    const certificateString = JSON.stringify(data);
    return this.web3.utils.sha3(certificateString);
  }

  // Verify certificate
  verifyCertificate(certificate, signature) {
    try {
      const recoveredAddress = this.web3.eth.accounts.recover(
        certificate.hash,
        signature
      );
      
      return recoveredAddress === this.account.address;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return false;
    }
  }

  // Get blockchain network stats
  async getNetworkStats() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const blockNumber = await this.web3.eth.getBlockNumber();
      const gasPrice = await this.web3.eth.getGasPrice();
      const latestBlock = await this.web3.eth.getBlock('latest');
      
      return {
        networkId: this.networkId,
        blockNumber,
        gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
        latestBlockTimestamp: latestBlock.timestamp,
        accountAddress: this.account.address
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
