const axios = require('axios');
const crypto = require('crypto');

class MpesaService {
  constructor() {
    this.baseURL = process.env.MPESA_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.initiatorName = process.env.MPESA_INITIATOR_NAME;
    this.initiatorPassword = process.env.MPESA_INITIATOR_PASSWORD;
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Generate OAuth token
  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  // STK Push for customer payment
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
      const password = crypto.createHash('sha256')
        .update(`${this.shortcode}${this.passkey}${timestamp}`)
        .digest('base64');

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.CustomerMessage
      };

    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to initiate STK Push'
      };
    }
  }

  // Query STK Push status
  async querySTKStatus(checkoutRequestID) {
    try {
      const token = await this.getAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
      const password = crypto.createHash('sha256')
        .update(`${this.shortcode}${this.passkey}${timestamp}`)
        .digest('base64');

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        metadata: response.data.ResultParameters?.ResultParameter || []
      };

    } catch (error) {
      console.error('STK Query error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to query STK status'
      };
    }
  }

  // B2C payment (disbursement to riders)
  async initiateB2C(paymentData) {
    try {
      const token = await this.getAccessToken();
      
      const securityCredential = crypto.createHash('sha256')
        .update(this.initiatorPassword)
        .digest('base64');

      const requestBody = {
        InitiatorName: this.initiatorName,
        SecurityCredential: securityCredential,
        CommandID: 'BusinessPayment',
        Amount: paymentData.amount,
        PartyA: this.shortcode,
        PartyB: paymentData.phoneNumber,
        Remarks: paymentData.remarks || 'Payment for delivery service',
        QueueTimeOutURL: `${process.env.BACKEND_URL}/api/payments/mpesa/b2c/timeout`,
        ResultURL: `${process.env.BACKEND_URL}/api/payments/mpesa/b2c/result`,
        Occasion: paymentData.occasion || 'Payment'
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        conversationID: response.data.ConversationID,
        originatorConversationID: response.data.OriginatorConversationID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription
      };

    } catch (error) {
      console.error('B2C Payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to initiate B2C payment'
      };
    }
  }

  // Parse callback data
  parseCallback(callbackData) {
    try {
      const stkCallback = callbackData.Body.stkCallback;
      
      return {
        merchantRequestID: stkCallback.MerchantRequestID,
        checkoutRequestID: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
        metadata: stkCallback.CallbackMetadata?.Item || []
      };

    } catch (error) {
      console.error('Callback parsing error:', error);
      return null;
    }
  }

  // Extract specific metadata from callback
  extractMetadata(metadata, key) {
    const item = metadata.find(item => item.Name === key);
    return item ? item.Value : null;
  }

  // Validate phone number (ensure it's in Kenyan format)
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Kenyan number
    if (cleanPhone.length === 12 && cleanPhone.startsWith('254')) {
      return cleanPhone;
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      return '254' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9) {
      return '254' + cleanPhone;
    }
    
    return null;
  }

  // Generate account reference for transactions
  generateAccountReference(orderId, userType) {
    const prefix = userType === 'seller' ? 'SEL' : 'RID';
    return `${prefix}${orderId}${Date.now().toString().slice(-6)}`;
  }

  // Calculate transaction fees
  calculateTransactionFee(amount) {
    // M-Pesa transaction fees (simplified)
    if (amount <= 100) return 0;
    if (amount <= 500) return 27;
    if (amount <= 1000) return 52;
    if (amount <= 1500) return 67;
    if (amount <= 2500) return 97;
    if (amount <= 3500) return 117;
    if (amount <= 5000) return 147;
    if (amount <= 7500) return 187;
    if (amount <= 10000) return 217;
    if (amount <= 20000) return 267;
    if (amount <= 35000) return 337;
    if (amount <= 50000) return 397;
    if (amount <= 70000) return 467;
    return 567;
  }
}

module.exports = new MpesaService();
