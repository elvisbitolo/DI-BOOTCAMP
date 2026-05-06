const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

class ComputerVisionService {
  constructor() {
    this.objectDetectionModel = null;
    this.ocrModel = null;
    this.faceRecognitionModel = null;
    this.isInitialized = false;
    this.modelsPath = path.join(__dirname, '../models');
  }

  // Initialize computer vision models
  async initialize() {
    try {
      // Create models directory if it doesn't exist
      if (!fs.existsSync(this.modelsPath)) {
        fs.mkdirSync(this.modelsPath, { recursive: true });
      }

      // Initialize object detection model
      await this.initializeObjectDetection();
      
      // Initialize OCR model
      await this.initializeOCR();
      
      // Initialize face recognition model
      await this.initializeFaceRecognition();
      
      this.isInitialized = true;
      console.log('Computer vision service initialized successfully');
    } catch (error) {
      console.error('Error initializing computer vision service:', error);
      throw error;
    }
  }

  // Initialize object detection model
  async initializeObjectDetection() {
    try {
      // Create a simple object detection model for package verification
      this.objectDetectionModel = tf.sequential({
        layers: [
          tf.layers.conv2d({
            inputShape: [224, 224, 3],
            filters: 32,
            kernelSize: 3,
            activation: 'relu'
          }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 256, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.5 }),
          tf.layers.dense({ units: 10, activation: 'softmax' }) // 10 object classes
        ]
      });

      // Compile model
      this.objectDetectionModel.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      console.log('Object detection model initialized');
    } catch (error) {
      console.error('Error initializing object detection:', error);
      // Create a mock model for development
      this.objectDetectionModel = this.createMockModel();
    }
  }

  // Initialize OCR model
  async initializeOCR() {
    try {
      // Create a simple OCR model for text recognition
      this.ocrModel = tf.sequential({
        layers: [
          tf.layers.conv2d({
            inputShape: [64, 256, 1],
            filters: 32,
            kernelSize: 3,
            activation: 'relu'
          }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.5 }),
          tf.layers.dense({ units: 62, activation: 'softmax' }) // 62 characters (a-z, A-Z, 0-9)
        ]
      });

      this.ocrModel.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      console.log('OCR model initialized');
    } catch (error) {
      console.error('Error initializing OCR:', error);
      this.ocrModel = this.createMockModel();
    }
  }

  // Initialize face recognition model
  async initializeFaceRecognition() {
    try {
      // Create a face recognition model
      this.faceRecognitionModel = tf.sequential({
        layers: [
          tf.layers.conv2d({
            inputShape: [160, 160, 3],
            filters: 32,
            kernelSize: 3,
            activation: 'relu'
          }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 512, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.5 }),
          tf.layers.dense({ units: 128, activation: 'relu' }) // Face embedding
        ]
      });

      this.faceRecognitionModel.compile({
        optimizer: 'adam',
        loss: 'tripletLoss',
        metrics: ['accuracy']
      });

      console.log('Face recognition model initialized');
    } catch (error) {
      console.error('Error initializing face recognition:', error);
      this.faceRecognitionModel = this.createMockModel();
    }
  }

  // Create mock model for development
  createMockModel() {
    return {
      predict: async (input) => {
        return {
          dataSync: () => [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]
        };
      },
      compile: () => {}
    };
  }

  // Verify package with computer vision
  async verifyPackage(imageBuffer, expectedFeatures = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Process image
      const processedImage = await this.processImage(imageBuffer);
      
      // Detect objects in image
      const objects = await this.detectObjects(processedImage);
      
      // Extract text from image
      const text = await this.extractText(processedImage);
      
      // Verify against expected features
      const verification = this.verifyFeatures(objects, text, expectedFeatures);
      
      // Generate confidence score
      const confidence = this.calculateConfidence(objects, text, expectedFeatures);
      
      return {
        verified: verification.verified,
        confidence: confidence,
        detectedObjects: objects,
        extractedText: text,
        verification: verification,
        timestamp: new Date(),
        imageMetadata: await this.getImageMetadata(imageBuffer)
      };
    } catch (error) {
      console.error('Error verifying package:', error);
      throw error;
    }
  }

  // Process image for analysis
  async processImage(imageBuffer) {
    try {
      // Use sharp to process image
      const image = sharp(imageBuffer);
      
      // Get image metadata
      const metadata = await image.metadata();
      
      // Resize to standard size
      const resizedImage = await image
        .resize(224, 224)
        .removeAlpha()
        .toBuffer();
      
      // Convert to tensor
      const imageTensor = tf.node.decodeImage(resizedImage);
      const normalizedImage = imageTensor.div(255.0);
      
      return {
        tensor: normalizedImage,
        buffer: resizedImage,
        metadata: metadata
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Detect objects in image
  async detectObjects(processedImage) {
    try {
      // Use object detection model
      const prediction = await this.objectDetectionModel.predict(
        processedImage.tensor.expandDims(0)
      );
      
      const probabilities = prediction.dataSync();
      
      // Object classes (mock)
      const objectClasses = [
        'package', 'box', 'envelope', 'bag', 'document',
        'fragile', 'liquid', 'electronics', 'food', 'clothing'
      ];
      
      // Get top predictions
      const topPredictions = probabilities
        .map((prob, index) => ({
          class: objectClasses[index],
          confidence: prob,
          index: index
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      // Filter by confidence threshold
      const detectedObjects = topPredictions.filter(obj => obj.confidence > 0.3);
      
      return detectedObjects;
    } catch (error) {
      console.error('Error detecting objects:', error);
      return [];
    }
  }

  // Extract text from image
  async extractText(processedImage) {
    try {
      // Preprocess for OCR
      const grayImage = await sharp(processedImage.buffer)
        .greyscale()
        .resize(64, 256)
        .toBuffer();
      
      const imageTensor = tf.node.decodeImage(grayImage);
      const normalizedImage = imageTensor.div(255.0);
      
      // Use OCR model
      const prediction = await this.ocrModel.predict(
        normalizedImage.expandDims(0)
      );
      
      const probabilities = prediction.dataSync();
      
      // Character classes
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      
      // Extract text from predictions
      let extractedText = '';
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > 0.5) {
          extractedText += characters[i];
        }
      }
      
      return extractedText;
    } catch (error) {
      console.error('Error extracting text:', error);
      return '';
    }
  }

  // Verify detected features against expected features
  verifyFeatures(detectedObjects, extractedText, expectedFeatures) {
    const verification = {
      verified: true,
      issues: [],
      matches: []
    };

    // Check object types
    if (expectedFeatures.objectType) {
      const matchingObject = detectedObjects.find(obj => 
        obj.class === expectedFeatures.objectType
      );
      
      if (matchingObject) {
        verification.matches.push({
          type: 'object',
          expected: expectedFeatures.objectType,
          detected: matchingObject.class,
          confidence: matchingObject.confidence
        });
      } else {
        verification.verified = false;
        verification.issues.push({
          type: 'object_mismatch',
          expected: expectedFeatures.objectType,
          detected: detectedObjects.map(obj => obj.class)
        });
      }
    }

    // Check text content
    if (expectedFeatures.expectedText) {
      const textMatch = this.similarity(extractedText, expectedFeatures.expectedText);
      
      if (textMatch > 0.7) {
        verification.matches.push({
          type: 'text',
          expected: expectedFeatures.expectedText,
          detected: extractedText,
          confidence: textMatch
        });
      } else {
        verification.verified = false;
        verification.issues.push({
          type: 'text_mismatch',
          expected: expectedFeatures.expectedText,
          detected: extractedText,
          similarity: textMatch
        });
      }
    }

    // Check dimensions (if provided)
    if (expectedFeatures.dimensions) {
      // Mock dimension verification
      verification.matches.push({
        type: 'dimensions',
        expected: expectedFeatures.dimensions,
        detected: 'estimated_from_image',
        confidence: 0.8
      });
    }

    return verification;
  }

  // Calculate confidence score
  calculateConfidence(objects, text, expectedFeatures) {
    let confidence = 0;
    let factors = 0;

    // Object detection confidence
    if (objects.length > 0) {
      const avgObjectConfidence = objects.reduce((sum, obj) => sum + obj.confidence, 0) / objects.length;
      confidence += avgObjectConfidence * 0.4;
      factors += 0.4;
    }

    // Text extraction confidence
    if (text && expectedFeatures.expectedText) {
      const textConfidence = this.similarity(text, expectedFeatures.expectedText);
      confidence += textConfidence * 0.3;
      factors += 0.3;
    }

    // Image quality confidence
    confidence += 0.3; // Assume good image quality
    factors += 0.3;

    return factors > 0 ? confidence / factors : 0;
  }

  // Calculate text similarity
  similarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Calculate Levenshtein distance
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get image metadata
  async getImageMetadata(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        format: metadata.format,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        channels: metadata.channels,
        depth: metadata.depth
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return {};
    }
  }

  // Verify person identity
  async verifyPerson(imageBuffer, referenceImages = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Process face image
      const processedImage = await this.processFaceImage(imageBuffer);
      
      // Extract face embedding
      const faceEmbedding = await this.extractFaceEmbedding(processedImage);
      
      // Compare with reference images
      const matches = [];
      
      for (const referenceImage of referenceImages) {
        const referenceEmbedding = await this.extractFaceEmbedding(referenceImage);
        const similarity = this.calculateFaceSimilarity(faceEmbedding, referenceEmbedding);
        
        matches.push({
          referenceId: referenceImage.id,
          similarity: similarity,
          verified: similarity > 0.7
        });
      }
      
      // Sort by similarity
      matches.sort((a, b) => b.similarity - a.similarity);
      
      return {
        verified: matches.length > 0 && matches[0].similarity > 0.7,
        confidence: matches.length > 0 ? matches[0].similarity : 0,
        matches: matches,
        faceDetected: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error verifying person:', error);
      return {
        verified: false,
        confidence: 0,
        matches: [],
        faceDetected: false,
        error: error.message
      };
    }
  }

  // Process face image
  async processFaceImage(imageBuffer) {
    try {
      // Use sharp to process face image
      const processedImage = await sharp(imageBuffer)
        .resize(160, 160)
        .removeAlpha()
        .modulate({ brightness: 1.2, saturation: 1.1 })
        .sharpen()
        .toBuffer();
      
      // Convert to tensor
      const imageTensor = tf.node.decodeImage(processedImage);
      const normalizedImage = imageTensor.div(255.0);
      
      return normalizedImage.expandDims(0);
    } catch (error) {
      console.error('Error processing face image:', error);
      throw error;
    }
  }

  // Extract face embedding
  async extractFaceEmbedding(faceImage) {
    try {
      const embedding = await this.faceRecognitionModel.predict(faceImage);
      return embedding.dataSync();
    } catch (error) {
      console.error('Error extracting face embedding:', error);
      throw error;
    }
  }

  // Calculate face similarity
  calculateFaceSimilarity(embedding1, embedding2) {
    try {
      // Calculate cosine similarity
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (let i = 0; i < embedding1.length; i++) {
        dotProduct += embedding1[i] * embedding2[i];
        norm1 += embedding1[i] * embedding1[i];
        norm2 += embedding2[i] * embedding2[i];
      }
      
      norm1 = Math.sqrt(norm1);
      norm2 = Math.sqrt(norm2);
      
      if (norm1 === 0 || norm2 === 0) return 0;
      
      return dotProduct / (norm1 * norm2);
    } catch (error) {
      console.error('Error calculating face similarity:', error);
      return 0;
    }
  }

  // Detect damage in package
  async detectDamage(imageBuffer) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Process image
      const processedImage = await this.processImage(imageBuffer);
      
      // Detect potential damage indicators
      const damageIndicators = await this.analyzeDamageIndicators(processedImage);
      
      // Calculate damage probability
      const damageProbability = this.calculateDamageProbability(damageIndicators);
      
      return {
        damageDetected: damageProbability > 0.5,
        probability: damageProbability,
        indicators: damageIndicators,
        timestamp: new Date(),
        recommendations: this.getDamageRecommendations(damageIndicators)
      };
    } catch (error) {
      console.error('Error detecting damage:', error);
      return {
        damageDetected: false,
        probability: 0,
        indicators: [],
        error: error.message
      };
    }
  }

  // Analyze damage indicators
  async analyzeDamageIndicators(processedImage) {
    try {
      // Mock damage analysis
      const indicators = [];
      
      // Check for tears, cracks, water damage, etc.
      // This would use advanced image processing techniques
      
      // Mock indicators
      if (Math.random() > 0.7) {
        indicators.push({
          type: 'tear',
          confidence: 0.8,
          location: 'edge',
          severity: 'medium'
        });
      }
      
      if (Math.random() > 0.8) {
        indicators.push({
          type: 'water_damage',
          confidence: 0.9,
          location: 'surface',
          severity: 'high'
        });
      }
      
      return indicators;
    } catch (error) {
      console.error('Error analyzing damage indicators:', error);
      return [];
    }
  }

  // Calculate damage probability
  calculateDamageProbability(indicators) {
    if (indicators.length === 0) return 0;
    
    const totalConfidence = indicators.reduce((sum, indicator) => sum + indicator.confidence, 0);
    const avgConfidence = totalConfidence / indicators.length;
    
    // Weight by severity
    const severityWeight = indicators.reduce((sum, indicator) => {
      const weight = indicator.severity === 'high' ? 1.0 : 
                     indicator.severity === 'medium' ? 0.7 : 0.3;
      return sum + (indicator.confidence * weight);
    }, 0);
    
    return Math.min(severityWeight / indicators.length, 1.0);
  }

  // Get damage recommendations
  getDamageRecommendations(indicators) {
    const recommendations = [];
    
    indicators.forEach(indicator => {
      switch (indicator.type) {
        case 'tear':
          recommendations.push('Package has tear - consider rewrapping or reinforcement');
          break;
        case 'water_damage':
          recommendations.push('Water damage detected - check contents for moisture');
          break;
        case 'crush':
          recommendations.push('Package appears crushed - inspect contents carefully');
          break;
        default:
          recommendations.push('Package condition requires attention');
      }
    });
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
}

module.exports = new ComputerVisionService();
