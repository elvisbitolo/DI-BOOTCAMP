const axios = require('axios');
const fs = require('fs');
const path = require('path');

class VoiceAssistantService {
  constructor() {
    this.isInitialized = false;
    this.conversationHistory = new Map();
    this.userProfiles = new Map();
    this.commands = new Map();
    this.intents = new Map();
    this.languages = ['en', 'sw', 'ki', 'lu', 'lo', 'ka', 'me', 'kj']; // English + Kenyan languages
  }

  // Initialize voice assistant
  async initialize() {
    try {
      // Initialize speech recognition
      await this.initializeSpeechRecognition();
      
      // Initialize text-to-speech
      await this.initializeTextToSpeech();
      
      // Initialize natural language processing
      await this.initializeNLP();
      
      // Load voice commands
      await this.loadVoiceCommands();
      
      // Set up conversation contexts
      await this.setupConversationContexts();
      
      this.isInitialized = true;
      console.log('Voice assistant service initialized successfully');
    } catch (error) {
      console.error('Error initializing voice assistant:', error);
      throw error;
    }
  }

  // Initialize speech recognition
  async initializeSpeechRecognition() {
    try {
      // Mock speech recognition service
      this.speechRecognition = {
        recognize: async (audioBuffer, language = 'en') => {
          // In production, use Google Speech-to-Text, Azure Speech, or similar
          return new Promise((resolve, reject) => {
            // Mock recognition
            setTimeout(() => {
              const mockTexts = {
                'en': ['create new order', 'track my delivery', 'contact rider', 'check balance'],
                'sw': ['tengeneza oda mpya', 'fuata usalama wangu', 'wasiliana na mpanda baiskeli', 'angalia salio'],
                'ki': ['thonduo thirikari ndima', 'thirikari wakwa', 'thuthuria na muthee', 'thonduo thirikari']
              };
              
              const texts = mockTexts[language] || mockTexts['en'];
              const randomText = texts[Math.floor(Math.random() * texts.length)];
              
              resolve({
                text: randomText,
                confidence: 0.85 + Math.random() * 0.15,
                language: language,
                alternatives: texts.slice(0, 3)
              });
            }, 1000);
          });
        }
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      throw error;
    }
  }

  // Initialize text-to-speech
  async initializeTextToSpeech() {
    try {
      // Mock text-to-speech service
      this.textToSpeech = {
        synthesize: async (text, language = 'en', voice = 'female') => {
          return new Promise((resolve, reject) => {
            // Mock TTS
            setTimeout(() => {
              resolve({
                audioBuffer: Buffer.from('mock_audio_data'),
                duration: text.length * 0.1, // Mock duration
                language: language,
                voice: voice,
                text: text
              });
            }, 500);
          });
        }
      };
    } catch (error) {
      console.error('Error initializing text-to-speech:', error);
      throw error;
    }
  }

  // Initialize natural language processing
  async initializeNLP() {
    try {
      // Mock NLP service for intent recognition
      this.nlp = {
        analyzeIntent: async (text, language = 'en') => {
          const intents = {
            'en': {
              'create_order': ['create', 'new', 'order', 'delivery', 'send'],
              'track_order': ['track', 'where', 'status', 'location', 'delivery'],
              'contact_rider': ['contact', 'call', 'message', 'rider', 'driver'],
              'check_balance': ['balance', 'money', 'account', 'wallet', 'earnings'],
              'cancel_order': ['cancel', 'stop', 'delete', 'order'],
              'help': ['help', 'assist', 'support', 'how to']
            },
            'sw': {
              'create_order': ['tengeneza', 'mpya', 'oda', 'usalama', 'tuma'],
              'track_order': ['fuata', 'wapi', 'hali', 'mahali', 'usalama'],
              'contact_rider': ['wasiliana', 'piga', 'ujumbe', 'mpanda', 'baiskeli'],
              'check_balance': ['salio', 'pesa', 'akaunti', 'mkoba', 'mapato'],
              'cancel_order': ['ghairi', 'acha', 'futa', 'oda'],
              'help': ['saidia', 'msaada', 'usaidie', 'vipi']
            }
          };

          const languageIntents = intents[language] || intents['en'];
          
          for (const [intent, keywords] of Object.entries(languageIntents)) {
            const matchedKeywords = keywords.filter(keyword => 
              text.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (matchedKeywords.length > 0) {
              return {
                intent: intent,
                confidence: matchedKeywords.length / keywords.length,
                keywords: matchedKeywords
              };
            }
          }
          
          return {
            intent: 'unknown',
            confidence: 0,
            keywords: []
          };
        },
        
        extractEntities: async (text, intent) => {
          const entities = {};
          
          // Extract locations
          const locationPatterns = [
            /(?:to|from|at|in)\s+([A-Za-z\s]+)/gi,
            /(?:kwa|katika|kwenye)\s+([A-Za-z\s]+)/gi
          ];
          
          for (const pattern of locationPatterns) {
            const match = text.match(pattern);
            if (match) {
              entities.location = match[1].trim();
            }
          }
          
          // Extract phone numbers
          const phonePattern = /(?:\+?254|0)?[\d\s-()]{9,}/g;
          const phoneMatch = text.match(phonePattern);
          if (phoneMatch) {
            entities.phone = phoneMatch[0];
          }
          
          // Extract amounts
          const amountPattern = /(?:KES|Ksh|sh|tsh)?\s*[\d,]+/g;
          const amountMatch = text.match(amountPattern);
          if (amountMatch) {
            entities.amount = amountMatch[0].replace(/[^\d]/g, '');
          }
          
          return entities;
        }
      };
    } catch (error) {
      console.error('Error initializing NLP:', error);
      throw error;
    }
  }

  // Load voice commands
  async loadVoiceCommands() {
    try {
      const commands = {
        'en': {
          'create_order': {
            patterns: ['create order', 'new delivery', 'send package', 'book delivery'],
            parameters: ['pickup_location', 'delivery_location', 'package_description'],
            response: 'I can help you create a new delivery order. Please provide the pickup and delivery locations.'
          },
          'track_order': {
            patterns: ['track order', 'where is my delivery', 'order status'],
            parameters: ['order_id'],
            response: 'I can help you track your order. Please provide your order number.'
          },
          'contact_rider': {
            patterns: ['contact rider', 'call driver', 'message rider'],
            parameters: ['order_id'],
            response: 'I can help you contact your rider. Please provide your order number.'
          },
          'check_balance': {
            patterns: ['check balance', 'my earnings', 'account balance'],
            parameters: [],
            response: 'I can check your account balance and earnings.'
          },
          'help': {
            patterns: ['help', 'what can you do', 'commands'],
            parameters: [],
            response: 'I can help you create orders, track deliveries, contact riders, check your balance, and more.'
          }
        },
        'sw': {
          'create_order': {
            patterns: ['tengeneza oda', 'usalama mpya', 'tuma kifurushi', 'book usalama'],
            parameters: ['mahali_pokuchukua', 'mahali_kusilisha', 'maelezo_kifurushi'],
            response: 'Naweza kukusaidia kuunda oda mpya ya usalama. Tafadhali toa mahali pa kuchukua na kusilisha.'
          },
          'track_order': {
            patterns: ['fuata oda', 'oda iko wapi', 'hali ya oda'],
            parameters: ['namba_oda'],
            response: 'Naweza kukusaidia kufuata oda yako. Tafadhali toa namba ya oda.'
          },
          'contact_rider': {
            patterns: ['wasiliana na mpanda', 'piga simu mpanda', 'ujumbe mpanda'],
            parameters: ['namba_oda'],
            response: 'Naweza kukusaidia kuwasiliana na mpanda baiskeli. Tafadhali toa namba ya oda.'
          },
          'check_balance': {
            patterns: ['angalia salio', 'mapato yangu', 'salio akaunti'],
            parameters: [],
            response: 'Naweza kukusaidia kuangalia salio lako na mapato yako.'
          },
          'help': {
            patterns: ['saidia', 'unaweza nini', 'maagizo'],
            parameters: [],
            response: 'Naweza kukusaidia kuunda oda, kufuata usalama, kuwasiliana na wapanda baiskeli, kuangalia salio, na zaidi.'
          }
        }
      };

      this.commands = commands;
      console.log('Voice commands loaded');
    } catch (error) {
      console.error('Error loading voice commands:', error);
      throw error;
    }
  }

  // Setup conversation contexts
  async setupConversationContexts() {
    try {
      this.contexts = {
        'order_creation': {
          required_params: ['pickup_location', 'delivery_location', 'package_description'],
          current_step: 0,
          collected_params: {}
        },
        'order_tracking': {
          required_params: ['order_id'],
          current_step: 0,
          collected_params: {}
        },
        'rider_contact': {
          required_params: ['order_id'],
          current_step: 0,
          collected_params: {}
        }
      };
    } catch (error) {
      console.error('Error setting up conversation contexts:', error);
      throw error;
    }
  }

  // Process voice command
  async processVoiceCommand(audioBuffer, userId, language = 'en') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get user profile
      const userProfile = this.getUserProfile(userId);
      
      // Convert speech to text
      const speechResult = await this.speechRecognition.recognize(audioBuffer, language);
      
      // Analyze intent
      const intentResult = await this.nlp.analyzeIntent(speechResult.text, language);
      
      // Extract entities
      const entities = await this.nlp.extractEntities(speechResult.text, intentResult.intent);
      
      // Process command based on intent
      const commandResult = await this.processCommand(
        intentResult.intent,
        entities,
        userId,
        language,
        speechResult.text
      );
      
      // Generate response
      const response = await this.generateResponse(
        commandResult,
        intentResult,
        entities,
        userId,
        language
      );
      
      // Convert response to speech
      const speechResponse = await this.textToSpeech.synthesize(
        response.text,
        language,
        userProfile.voice || 'female'
      );
      
      // Store conversation history
      this.storeConversationHistory(userId, {
        input: speechResult.text,
        intent: intentResult.intent,
        entities: entities,
        response: response.text,
        timestamp: new Date(),
        language: language
      });
      
      return {
        success: true,
        input: speechResult,
        intent: intentResult,
        entities: entities,
        command: commandResult,
        response: response,
        audio: speechResponse,
        confidence: speechResult.confidence
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        success: false,
        error: error.message,
        input: null,
        intent: null,
        response: {
          text: 'Sorry, I had trouble understanding that. Please try again.',
          type: 'error'
        }
      };
    }
  }

  // Process command based on intent
  async processCommand(intent, entities, userId, language, originalText) {
    try {
      const userProfile = this.getUserProfile(userId);
      
      switch (intent) {
        case 'create_order':
          return await this.handleCreateOrder(entities, userId, language);
          
        case 'track_order':
          return await this.handleTrackOrder(entities, userId, language);
          
        case 'contact_rider':
          return await this.handleContactRider(entities, userId, language);
          
        case 'check_balance':
          return await this.handleCheckBalance(userId, language);
          
        case 'cancel_order':
          return await this.handleCancelOrder(entities, userId, language);
          
        case 'help':
          return await this.handleHelp(userId, language);
          
        default:
          return {
            success: false,
            type: 'unknown_command',
            message: 'I didn\'t understand that command. Please try again.',
            suggestions: this.getCommandSuggestions(language)
          };
      }
    } catch (error) {
      console.error('Error processing command:', error);
      return {
        success: false,
        type: 'error',
        message: 'Sorry, I encountered an error processing your request.',
        error: error.message
      };
    }
  }

  // Handle create order command
  async handleCreateOrder(entities, userId, language) {
    try {
      const context = this.getContext(userId, 'order_creation');
      
      // Update context with extracted entities
      if (entities.location) {
        if (!context.collected_params.pickup_location) {
          context.collected_params.pickup_location = entities.location;
        } else if (!context.collected_params.delivery_location) {
          context.collected_params.delivery_location = entities.location;
        }
      }
      
      if (entities.phone) {
        context.collected_params.phone = entities.phone;
      }
      
      // Check if we have all required parameters
      const missingParams = this.getMissingParams(context);
      
      if (missingParams.length > 0) {
        return {
          success: true,
          type: 'parameter_collection',
          message: this.getParameterCollectionMessage(missingParams, language),
          context: context,
          missing_params: missingParams
        };
      }
      
      // Create the order
      const orderData = {
        userId: userId,
        pickupLocation: context.collected_params.pickup_location,
        deliveryLocation: context.collected_params.delivery_location,
        phone: context.collected_params.phone,
        packageDescription: context.collected_params.package_description || 'Voice-created order',
        source: 'voice_assistant'
      };
      
      // TODO: Call order creation API
      console.log('Creating order:', orderData);
      
      // Clear context
      this.clearContext(userId);
      
      return {
        success: true,
        type: 'order_created',
        message: this.getOrderCreatedMessage(language),
        orderData: orderData
      };
    } catch (error) {
      console.error('Error handling create order:', error);
      throw error;
    }
  }

  // Handle track order command
  async handleTrackOrder(entities, userId, language) {
    try {
      if (!entities.order_id) {
        return {
          success: true,
          type: 'parameter_collection',
          message: this.getOrderIdRequestMessage(language),
          required_param: 'order_id'
        };
      }
      
      // TODO: Call order tracking API
      console.log('Tracking order:', entities.order_id);
      
      return {
        success: true,
        type: 'order_status',
        message: this.getOrderStatusMessage(entities.order_id, language),
        order_id: entities.order_id
      };
    } catch (error) {
      console.error('Error handling track order:', error);
      throw error;
    }
  }

  // Handle contact rider command
  async handleContactRider(entities, userId, language) {
    try {
      if (!entities.order_id) {
        return {
          success: true,
          type: 'parameter_collection',
          message: this.getOrderIdRequestMessage(language),
          required_param: 'order_id'
        };
      }
      
      // TODO: Call rider contact API
      console.log('Contacting rider for order:', entities.order_id);
      
      return {
        success: true,
        type: 'rider_contact',
        message: this.getRiderContactMessage(entities.order_id, language),
        order_id: entities.order_id
      };
    } catch (error) {
      console.error('Error handling contact rider:', error);
      throw error;
    }
  }

  // Handle check balance command
  async handleCheckBalance(userId, language) {
    try {
      // TODO: Call balance check API
      console.log('Checking balance for user:', userId);
      
      return {
        success: true,
        type: 'balance_info',
        message: this.getBalanceMessage(language),
        balance: {
          available: 2500,
          pending: 500,
          total: 3000
        }
      };
    } catch (error) {
      console.error('Error handling check balance:', error);
      throw error;
    }
  }

  // Handle cancel order command
  async handleCancelOrder(entities, userId, language) {
    try {
      if (!entities.order_id) {
        return {
          success: true,
          type: 'parameter_collection',
          message: this.getOrderIdRequestMessage(language),
          required_param: 'order_id'
        };
      }
      
      // TODO: Call order cancellation API
      console.log('Cancelling order:', entities.order_id);
      
      return {
        success: true,
        type: 'order_cancelled',
        message: this.getOrderCancelledMessage(entities.order_id, language),
        order_id: entities.order_id
      };
    } catch (error) {
      console.error('Error handling cancel order:', error);
      throw error;
    }
  }

  // Handle help command
  async handleHelp(userId, language) {
    try {
      const commands = this.commands[language] || this.commands['en'];
      
      return {
        success: true,
        type: 'help',
        message: this.getHelpMessage(commands, language),
        commands: Object.keys(commands)
      };
    } catch (error) {
      console.error('Error handling help:', error);
      throw error;
    }
  }

  // Generate response
  async generateResponse(commandResult, intentResult, entities, userId, language) {
    try {
      const responses = {
        'en': {
          'order_created': 'Your order has been created successfully! I\'ll notify you when a rider accepts it.',
          'order_status': 'Your order is currently being processed. You\'ll receive updates shortly.',
          'rider_contact': 'I\'ve connected you with your rider. You can now communicate directly.',
          'balance_info': 'Your current balance is available. You can check your earnings in the app.',
          'order_cancelled': 'Your order has been cancelled. Any payment will be refunded.',
          'help': 'I can help you create orders, track deliveries, contact riders, and check your balance.',
          'error': 'Sorry, I encountered an error. Please try again.',
          'unknown_command': 'I didn\'t understand that. You can say "help" to see available commands.'
        },
        'sw': {
          'order_created': 'Oda yako imeundwa kwa mafanikio! Nitakuaribu wakati mpanda baiskeli ataikubali.',
          'order_status': 'Oda yako inashughulikwa sasa. Utapata taarifa hivi karibuni.',
          'rider_contact': 'Nimekuunganisha na mpanda baiskeli wako. Sasa unaweza kuwasiliana moja kwa moja.',
          'balance_info': 'Salio lako linapatikana. Unaweza kuangalia mapato yako katika programu.',
          'order_cancelled': 'Oda yako imeghairiwa. Malipo yoyote yatarudishwa.',
          'help': 'Naweza kukusaidia kuunda oda, kufuata usalama, kuwasiliana na wapanda baiskeli, na kuangalia salio.',
          'error': 'Samahani, nilikutatia changamoto. Tafadhali jaribu tena.',
          'unknown_command': 'Sikuelewa hilo. Unaweza kusema "saidia" kuona maagizo yanayopatikana.'
        }
      };

      const langResponses = responses[language] || responses['en'];
      
      return {
        text: commandResult.message || langResponses[commandResult.type] || langResponses['error'],
        type: commandResult.type,
        data: commandResult
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        text: 'Sorry, I had trouble generating a response.',
        type: 'error'
      };
    }
  }

  // Get user profile
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        language: 'en',
        voice: 'female',
        preferences: {}
      });
    }
    return this.userProfiles.get(userId);
  }

  // Get context
  getContext(userId, contextType) {
    const contextKey = `${userId}_${contextType}`;
    if (!this.conversationHistory.has(contextKey)) {
      this.conversationHistory.set(contextKey, {
        type: contextType,
        userId: userId,
        required_params: this.contexts[contextType]?.required_params || [],
        current_step: 0,
        collected_params: {}
      });
    }
    return this.conversationHistory.get(contextKey);
  }

  // Clear context
  clearContext(userId) {
    for (const [key, context] of this.conversationHistory) {
      if (context.userId === userId) {
        this.conversationHistory.delete(key);
      }
    }
  }

  // Store conversation history
  storeConversationHistory(userId, conversation) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    history.push(conversation);
    
    // Keep only last 10 conversations
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }

  // Get missing parameters
  getMissingParams(context) {
    return context.required_params.filter(param => 
      !context.collected_params[param]
    );
  }

  // Get parameter collection message
  getParameterCollectionMessage(missingParams, language) {
    const messages = {
      'en': `I need some more information. Please provide: ${missingParams.join(', ')}.`,
      'sw': `Nahitaji maelezo zaidi. Tafadhali toa: ${missingParams.join(', ')}.`
    };
    return messages[language] || messages['en'];
  }

  // Get order ID request message
  getOrderIdRequestMessage(language) {
    const messages = {
      'en': 'Please provide your order number.',
      'sw': 'Tafadhali toa namba ya oda yako.'
    };
    return messages[language] || messages['en'];
  }

  // Get order created message
  getOrderCreatedMessage(language) {
    const messages = {
      'en': 'Your order has been created successfully!',
      'sw': 'Oda yako imeundwa kwa mafanikio!'
    };
    return messages[language] || messages['en'];
  }

  // Get order status message
  getOrderStatusMessage(orderId, language) {
    const messages = {
      'en': `Order ${orderId} is currently being processed.`,
      'sw': `Oda ${orderId} inashughulikwa sasa.`
    };
    return messages[language] || messages['en'];
  }

  // Get rider contact message
  getRiderContactMessage(orderId, language) {
    const messages = {
      'en': `I've connected you with your rider for order ${orderId}.`,
      'sw': `Nimekuunganisha na mpanda baiskeli wako kwa oda ${orderId}.`
    };
    return messages[language] || messages['en'];
  }

  // Get balance message
  getBalanceMessage(language) {
    const messages = {
      'en': 'Your current balance and earnings are available in your account.',
      'sw': 'Salio lako na mapato yako yanapatikana katika akaunti yako.'
    };
    return messages[language] || messages['en'];
  }

  // Get order cancelled message
  getOrderCancelledMessage(orderId, language) {
    const messages = {
      'en': `Order ${orderId} has been cancelled successfully.`,
      'sw': `Oda ${orderId} imeghairiwa kwa mafanikio.`
    };
    return messages[language] || messages['en'];
  }

  // Get help message
  getHelpMessage(commands, language) {
    const commandList = Object.keys(commands).join(', ');
    const messages = {
      'en': `I can help you with: ${commandList}. What would you like to do?`,
      'sw': `Naweza kukusaidia na: ${commandList}. Unataka kufanya nini?`
    };
    return messages[language] || messages['en'];
  }

  // Get command suggestions
  getCommandSuggestions(language) {
    const suggestions = {
      'en': ['create order', 'track delivery', 'contact rider', 'check balance'],
      'sw': ['tengeneza oda', 'fuata usalama', 'wasiliana na mpanda', 'angalia salio']
    };
    return suggestions[language] || suggestions['en'];
  }
}

module.exports = new VoiceAssistantService();
