const axios = require('axios');
const tf = require('@tensorflow/tfjs-node');

class AIRouteOptimizer {
  constructor() {
    this.model = null;
    this.trafficData = new Map();
    this.weatherData = new Map();
    this.historicalData = [];
    this.isModelLoaded = false;
  }

  // Initialize AI model for route optimization
  async initializeModel() {
    try {
      // Create a neural network model for route optimization
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'linear' })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      this.isModelLoaded = true;
      console.log('AI Route Optimizer model initialized');
    } catch (error) {
      console.error('Error initializing AI model:', error);
    }
  }

  // Predict optimal route using AI
  async predictOptimalRoute(startPoint, endPoint, constraints = {}) {
    try {
      if (!this.isModelLoaded) {
        await this.initializeModel();
      }

      // Get real-time traffic data
      const trafficData = await this.getTrafficData(startPoint, endPoint);
      
      // Get weather conditions
      const weatherData = await this.getWeatherData(startPoint);
      
      // Get historical data for similar routes
      const historicalData = this.getHistoricalData(startPoint, endPoint);
      
      // Prepare input features for AI model
      const features = this.prepareFeatures(
        startPoint, 
        endPoint, 
        trafficData, 
        weatherData, 
        historicalData,
        constraints
      );

      // Make prediction
      const prediction = await this.model.predict(tf.tensor2d([features]));
      const optimalTime = prediction.dataSync()[0];

      // Generate multiple route options
      const routeOptions = await this.generateRouteOptions(
        startPoint, 
        endPoint, 
        optimalTime, 
        constraints
      );

      return {
        optimalRoute: routeOptions[0],
        alternativeRoutes: routeOptions.slice(1),
        estimatedTime: optimalTime,
        confidence: this.calculateConfidence(features),
        factors: {
          traffic: trafficData.congestionLevel,
          weather: weatherData.condition,
          historical: historicalData.averageTime
        }
      };
    } catch (error) {
      console.error('Error predicting optimal route:', error);
      throw error;
    }
  }

  // Get real-time traffic data
  async getTrafficData(startPoint, endPoint) {
    try {
      // Simulate API call to traffic service (Google Maps API, HERE, etc.)
      const response = await axios.get(
        `https://api.traffic-service.com/traffic`,
        {
          params: {
            from: `${startPoint.lat},${startPoint.lng}`,
            to: `${endPoint.lat},${endPoint.lng}`,
            key: process.env.TRAFFIC_API_KEY
          }
        }
      );

      return {
        congestionLevel: response.data.congestion || 0.5,
        incidents: response.data.incidents || [],
        roadClosures: response.data.roadClosures || [],
        averageSpeed: response.data.averageSpeed || 40
      };
    } catch (error) {
      // Fallback to default values
      return {
        congestionLevel: 0.3,
        incidents: [],
        roadClosures: [],
        averageSpeed: 40
      };
    }
  }

  // Get weather data
  async getWeatherData(location) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: location.lat,
            lon: location.lng,
            appid: process.env.WEATHER_API_KEY,
            units: 'metric'
          }
        }
      );

      return {
        condition: response.data.weather[0].main,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        visibility: response.data.visibility
      };
    } catch (error) {
      return {
        condition: 'Clear',
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        visibility: 10000
      };
    }
  }

  // Get historical data
  getHistoricalData(startPoint, endPoint) {
    const routeKey = `${startPoint.lat},${startPoint.lng}-${endPoint.lat},${endPoint.lng}`;
    const data = this.historicalData.filter(d => d.route === routeKey);
    
    if (data.length === 0) {
      return {
        averageTime: 30,
        variance: 10,
        sampleSize: 0
      };
    }

    const times = data.map(d => d.deliveryTime);
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;

    return {
      averageTime: average,
      variance: variance,
      sampleSize: data.length
    };
  }

  // Prepare features for AI model
  prepareFeatures(startPoint, endPoint, traffic, weather, historical, constraints) {
    const distance = this.calculateDistance(startPoint, endPoint);
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    return [
      distance, // Distance in km
      traffic.congestionLevel, // Traffic congestion
      weather.temperature, // Temperature
      weather.humidity, // Humidity
      weather.windSpeed, // Wind speed
      timeOfDay / 24, // Normalized time of day
      dayOfWeek / 7, // Normalized day of week
      historical.averageTime, // Historical average time
      historical.variance, // Historical variance
      constraints.priority === 'urgent' ? 1 : 0 // Priority flag
    ];
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate multiple route options
  async generateRouteOptions(startPoint, endPoint, optimalTime, constraints) {
    const routes = [];
    
    // Generate 3 different route options
    for (let i = 0; i < 3; i++) {
      const route = await this.generateSingleRoute(startPoint, endPoint, i, constraints);
      routes.push(route);
    }
    
    return routes.sort((a, b) => a.estimatedTime - b.estimatedTime);
  }

  // Generate single route
  async generateSingleRoute(startPoint, endPoint, routeIndex, constraints) {
    // Simulate route generation with waypoints
    const waypoints = this.generateWaypoints(startPoint, endPoint, routeIndex);
    
    return {
      routeId: `route_${Date.now()}_${routeIndex}`,
      waypoints,
      estimatedTime: this.estimateRouteTime(waypoints, constraints),
      distance: this.calculateTotalDistance(waypoints),
      trafficLevel: this.estimateTrafficLevel(waypoints),
      difficulty: this.estimateDifficulty(waypoints, constraints),
      fuelCost: this.estimateFuelCost(waypoints),
      tollCost: this.estimateTollCost(waypoints)
    };
  }

  // Generate waypoints for route
  generateWaypoints(startPoint, endPoint, routeIndex) {
    const waypoints = [startPoint];
    
    // Generate intermediate waypoints based on route index
    const numWaypoints = 2 + routeIndex;
    for (let i = 1; i < numWaypoints; i++) {
      const progress = i / numWaypoints;
      const waypoint = {
        lat: startPoint.lat + (endPoint.lat - startPoint.lat) * progress,
        lng: startPoint.lng + (endPoint.lng - startPoint.lng) * progress + (routeIndex * 0.01)
      };
      waypoints.push(waypoint);
    }
    
    waypoints.push(endPoint);
    return waypoints;
  }

  // Estimate route time
  estimateRouteTime(waypoints, constraints) {
    let totalTime = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.calculateDistance(waypoints[i], waypoints[i + 1]);
      const speed = this.estimateSpeed(waypoints[i], waypoints[i + 1], constraints);
      totalTime += (distance / speed) * 60; // Convert to minutes
    }
    return totalTime;
  }

  // Estimate speed for route segment
  estimateSpeed(point1, point2, constraints) {
    const baseSpeed = 40; // km/h
    const trafficFactor = 0.8; // Assume moderate traffic
    const weatherFactor = 0.9; // Assume good weather
    const priorityFactor = constraints.priority === 'urgent' ? 1.2 : 1.0;
    
    return baseSpeed * trafficFactor * weatherFactor * priorityFactor;
  }

  // Calculate total distance
  calculateTotalDistance(waypoints) {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
    }
    return totalDistance;
  }

  // Estimate traffic level
  estimateTrafficLevel(waypoints) {
    // Simulate traffic estimation based on time and location
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
      return 'high';
    } else if (hour >= 10 && hour <= 16) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Estimate route difficulty
  estimateDifficulty(waypoints, constraints) {
    const distance = this.calculateTotalDistance(waypoints);
    const numTurns = waypoints.length - 2;
    
    if (distance > 50 || numTurns > 10) {
      return 'hard';
    } else if (distance > 20 || numTurns > 5) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  // Estimate fuel cost
  estimateFuelCost(waypoints) {
    const distance = this.calculateTotalDistance(waypoints);
    const fuelConsumption = 0.1; // liters per km
    const fuelPrice = 150; // KES per liter
    
    return Math.round(distance * fuelConsumption * fuelPrice);
  }

  // Estimate toll cost
  estimateTollCost(waypoints) {
    // Simulate toll cost estimation
    const distance = this.calculateTotalDistance(waypoints);
    return Math.round(distance * 2); // 2 KES per km
  }

  // Calculate prediction confidence
  calculateConfidence(features) {
    // Simple confidence calculation based on data quality
    const historicalDataQuality = features[8] > 0 ? 0.8 : 0.5;
    const trafficDataQuality = features[1] > 0 ? 0.9 : 0.6;
    
    return (historicalDataQuality + trafficDataQuality) / 2;
  }

  // Update historical data
  updateHistoricalData(route, actualTime) {
    const routeKey = `${route.start.lat},${route.start.lng}-${route.end.lat},${route.end.lng}`;
    
    this.historicalData.push({
      route: routeKey,
      deliveryTime: actualTime,
      timestamp: new Date(),
      conditions: route.conditions
    });
    
    // Keep only last 1000 records
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000);
    }
  }

  // Train model with new data
  async trainModel(trainingData) {
    if (!this.isModelLoaded) {
      await this.initializeModel();
    }

    try {
      const features = trainingData.map(d => d.features);
      const labels = trainingData.map(d => d.actualTime);

      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
          }
        }
      });

      xs.dispose();
      ys.dispose();
      
      console.log('Model training completed');
    } catch (error) {
      console.error('Error training model:', error);
    }
  }
}

module.exports = new AIRouteOptimizer();
