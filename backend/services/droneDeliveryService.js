const axios = require('axios');
const crypto = require('crypto');

class DroneDeliveryService {
  constructor() {
    this.drones = new Map();
    this.missions = new Map();
    this.noFlyZones = new Map();
    this.weatherService = null;
    this.flightPlans = new Map();
    this.isInitialized = false;
  }

  // Initialize drone delivery service
  async initialize() {
    try {
      // Initialize drone fleet
      await this.initializeDroneFleet();
      
      // Load no-fly zones
      await this.loadNoFlyZones();
      
      // Initialize weather service
      await this.initializeWeatherService();
      
      // Set up real-time monitoring
      await this.setupMonitoring();
      
      this.isInitialized = true;
      console.log('Drone delivery service initialized successfully');
    } catch (error) {
      console.error('Error initializing drone delivery service:', error);
      throw error;
    }
  }

  // Initialize drone fleet
  async initializeDroneFleet() {
    try {
      // Mock drone fleet data - in production, this would come from drone management system
      const droneFleet = [
        {
          id: 'DRONE_001',
          model: 'DJI Matrice 300',
          maxRange: 15000, // meters
          maxPayload: 2.7, // kg
          maxSpeed: 20, // m/s
          batteryLife: 55, // minutes
          status: 'available',
          location: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          lastMaintenance: new Date('2024-01-15'),
          certifications: ['commercial', 'night_flight'],
          sensors: ['GPS', 'IMU', 'camera', 'lidar', 'thermal']
        },
        {
          id: 'DRONE_002',
          model: 'DJI Phantom 4 Pro',
          maxRange: 7000, // meters
          maxPayload: 1.5, // kg
          maxSpeed: 20, // m/s
          batteryLife: 30, // minutes
          status: 'available',
          location: { lat: -1.2921, lng: 36.8219 },
          lastMaintenance: new Date('2024-02-01'),
          certifications: ['commercial'],
          sensors: ['GPS', 'IMU', 'camera', 'gimbal']
        },
        {
          id: 'DRONE_003',
          model: 'Autel EVO II',
          maxRange: 9000, // meters
          maxPayload: 2.0, // kg
          maxSpeed: 20, // m/s
          batteryLife: 40, // minutes
          status: 'maintenance',
          location: { lat: -1.2921, lng: 36.8219 },
          lastMaintenance: new Date('2024-01-20'),
          certifications: ['commercial', 'night_flight'],
          sensors: ['GPS', 'IMU', 'camera', 'thermal']
        }
      ];

      droneFleet.forEach(drone => {
        this.drones.set(drone.id, drone);
      });

      console.log(`Initialized drone fleet with ${droneFleet.length} drones`);
    } catch (error) {
      console.error('Error initializing drone fleet:', error);
      throw error;
    }
  }

  // Load no-fly zones
  async loadNoFlyZones() {
    try {
      // Mock no-fly zones - in production, this would come from aviation authorities
      const noFlyZones = [
        {
          id: 'Nairobi_Airport',
          name: 'Jomo Kenyatta International Airport',
          coordinates: [
            { lat: -1.3191, lng: 36.9278 },
            { lat: -1.3191, lng: 36.9878 },
            { lat: -1.2791, lng: 36.9878 },
            { lat: -1.2791, lng: 36.9278 }
          ],
          altitude: 1000, // meters
          type: 'permanent',
          reason: 'airport_protection'
        },
        {
          id: 'Presidential_Palace',
          name: 'State House Nairobi',
          coordinates: [
            { lat: -1.2833, lng: 36.8167 },
            { lat: -1.2833, lng: 36.8267 },
            { lat: -1.2733, lng: 36.8267 },
            { lat: -1.2733, lng: 36.8167 }
          ],
          altitude: 500,
          type: 'permanent',
          reason: 'security_zone'
        }
      ];

      noFlyZones.forEach(zone => {
        this.noFlyZones.set(zone.id, zone);
      });

      console.log(`Loaded ${noFlyZones.length} no-fly zones`);
    } catch (error) {
      console.error('Error loading no-fly zones:', error);
      throw error;
    }
  }

  // Initialize weather service
  async initializeWeatherService() {
    this.weatherService = {
      getCurrentWeather: async (location) => {
        try {
          // Mock weather data - in production, use real weather API
          return {
            temperature: 25,
            humidity: 60,
            windSpeed: 5,
            windDirection: 180,
            visibility: 10000,
            precipitation: 0,
            cloudCover: 30,
            conditions: 'clear',
            safeForFlight: true
          };
        } catch (error) {
          console.error('Error getting weather:', error);
          return null;
        }
      },
      
      getForecast: async (location, hours = 4) => {
        try {
          // Mock forecast data
          const forecast = [];
          for (let i = 0; i < hours; i++) {
            forecast.push({
              time: new Date(Date.now() + i * 3600000),
              temperature: 25 + Math.random() * 5,
              windSpeed: 5 + Math.random() * 10,
              conditions: Math.random() > 0.8 ? 'rain' : 'clear',
              safeForFlight: Math.random() > 0.1
            });
          }
          return forecast;
        } catch (error) {
          console.error('Error getting forecast:', error);
          return [];
        }
      }
    };
  }

  // Setup monitoring
  async setupMonitoring() {
    // Set up real-time drone monitoring
    setInterval(() => {
      this.updateDroneStatus();
    }, 30000); // Update every 30 seconds
  }

  // Update drone status
  async updateDroneStatus() {
    try {
      for (const [droneId, drone] of this.drones) {
        // Check battery status (mock)
        drone.batteryLevel = drone.batteryLevel || Math.random() * 100;
        
        // Check if drone needs maintenance
        const daysSinceMaintenance = Math.floor(
          (Date.now() - drone.lastMaintenance) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceMaintenance > 30) {
          drone.status = 'maintenance';
        }
      }
    } catch (error) {
      console.error('Error updating drone status:', error);
    }
  }

  // Check if drone delivery is possible
  async checkDroneDeliveryFeasibility(pickupLocation, deliveryLocation, packageInfo) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check package weight
      const availableDrones = this.getAvailableDrones(packageInfo.weight);
      if (availableDrones.length === 0) {
        return {
          feasible: false,
          reason: 'No available drones for this package weight',
          alternatives: ['ground_delivery']
        };
      }

      // Check weather conditions
      const weather = await this.weatherService.getCurrentWeather(pickupLocation);
      if (!weather.safeForFlight) {
        return {
          feasible: false,
          reason: 'Weather conditions not safe for flight',
          weather: weather,
          alternatives: ['ground_delivery', 'schedule_later']
        };
      }

      // Check no-fly zones
      const route = await this.calculateRoute(pickupLocation, deliveryLocation);
      const noFlyZoneConflicts = this.checkNoFlyZoneConflicts(route);
      if (noFlyZoneConflicts.length > 0) {
        return {
          feasible: false,
          reason: 'Route conflicts with no-fly zones',
          conflicts: noFlyZoneConflicts,
          alternatives: ['ground_delivery', 'alternate_route']
        };
      }

      // Check distance
      const distance = this.calculateDistance(pickupLocation, deliveryLocation);
      const maxRange = Math.max(...availableDrones.map(d => d.maxRange));
      if (distance > maxRange) {
        return {
          feasible: false,
          reason: 'Distance exceeds drone range',
          distance: distance,
          maxRange: maxRange,
          alternatives: ['ground_delivery', 'multi_hop_drone']
        };
      }

      // Calculate delivery time and cost
      const deliveryTime = await this.estimateDeliveryTime(route, availableDrones[0]);
      const cost = await this.calculateDeliveryCost(distance, packageInfo.weight, deliveryTime);

      return {
        feasible: true,
        availableDrones: availableDrones.length,
        estimatedTime: deliveryTime,
        estimatedCost: cost,
        route: route,
        weather: weather,
        confidence: 0.85
      };
    } catch (error) {
      console.error('Error checking drone delivery feasibility:', error);
      return {
        feasible: false,
        reason: 'Error checking feasibility',
        error: error.message
      };
    }
  }

  // Get available drones for package weight
  getAvailableDrones(packageWeight) {
    const availableDrones = [];
    
    for (const [droneId, drone] of this.drones) {
      if (drone.status === 'available' && 
          drone.maxPayload >= packageWeight &&
          drone.batteryLevel > 20) {
        availableDrones.push(drone);
      }
    }
    
    return availableDrones.sort((a, b) => b.maxPayload - a.maxPayload);
  }

  // Calculate route for drone
  async calculateRoute(pickupLocation, deliveryLocation) {
    try {
      // Simple straight-line route with altitude considerations
      const route = {
        waypoints: [
          {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
            altitude: 100, // Start altitude
            type: 'pickup'
          },
          {
            lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
            lng: (pickupLocation.lng + deliveryLocation.lng) / 2,
            altitude: 150, // Cruise altitude
            type: 'cruise'
          },
          {
            lat: deliveryLocation.lat,
            lng: deliveryLocation.lng,
            altitude: 50, // Landing altitude
            type: 'delivery'
          }
        ],
        distance: this.calculateDistance(pickupLocation, deliveryLocation),
        estimatedFlightTime: 0,
        batteryConsumption: 0
      };

      // Calculate estimated flight time
      route.estimatedFlightTime = (route.distance / 15) * 60; // 15 m/s average speed
      
      return route;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  }

  // Check no-fly zone conflicts
  checkNoFlyZoneConflicts(route) {
    const conflicts = [];
    
    for (const [zoneId, zone] of this.noFlyZones) {
      for (const waypoint of route.waypoints) {
        if (this.isPointInPolygon(waypoint, zone.coordinates)) {
          conflicts.push({
            zoneId: zoneId,
            zoneName: zone.name,
            reason: zone.reason,
            waypoint: waypoint
          });
        }
      }
    }
    
    return conflicts;
  }

  // Check if point is in polygon
  isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
          && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Estimate delivery time
  async estimateDeliveryTime(route, drone) {
    try {
      // Get weather forecast for route
      const weather = await this.weatherService.getCurrentWeather(route.waypoints[0]);
      
      // Base flight time
      let flightTime = route.estimatedFlightTime;
      
      // Weather adjustments
      if (weather.windSpeed > 10) {
        flightTime *= 1.2; // 20% slower in high wind
      }
      
      if (weather.conditions === 'rain') {
        flightTime *= 1.3; // 30% slower in rain
      }
      
      // Add preparation time
      const preparationTime = 10; // 10 minutes to prepare drone
      
      // Add landing and delivery time
      const landingTime = 5; // 5 minutes for landing and delivery
      
      const totalTime = preparationTime + flightTime + landingTime;
      
      return {
        totalTime: Math.round(totalTime),
        flightTime: Math.round(flightTime),
        preparationTime: preparationTime,
        landingTime: landingTime,
        weatherAdjustments: flightTime - route.estimatedFlightTime
      };
    } catch (error) {
      console.error('Error estimating delivery time:', error);
      return route.estimatedFlightTime + 15; // Fallback
    }
  }

  // Calculate delivery cost
  async calculateDeliveryCost(distance, weight, deliveryTime) {
    try {
      // Base cost calculation
      const baseCost = 500; // KES 500 base cost
      const distanceCost = distance * 0.5; // KES 0.5 per meter
      const weightCost = weight * 200; // KES 200 per kg
      const timeCost = deliveryTime * 10; // KES 10 per minute
      
      const totalCost = baseCost + distanceCost + weightCost + timeCost;
      
      // Apply premium for drone delivery
      const premiumMultiplier = 1.5;
      
      return {
        baseCost: baseCost,
        distanceCost: distanceCost,
        weightCost: weightCost,
        timeCost: timeCost,
        totalCost: Math.round(totalCost * premiumMultiplier),
        premiumMultiplier: premiumMultiplier
      };
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      return 1000; // Fallback cost
    }
  }

  // Create drone delivery mission
  async createDeliveryMission(orderData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        orderId,
        pickupLocation,
        deliveryLocation,
        packageInfo,
        priority = 'standard'
      } = orderData;

      // Check feasibility
      const feasibility = await this.checkDroneDeliveryFeasibility(
        pickupLocation,
        deliveryLocation,
        packageInfo
      );

      if (!feasibility.feasible) {
        throw new Error(`Drone delivery not feasible: ${feasibility.reason}`);
      }

      // Select best drone
      const selectedDrone = this.selectBestDrone(packageInfo.weight, priority);
      
      // Calculate route
      const route = await this.calculateRoute(pickupLocation, deliveryLocation);
      
      // Create mission
      const mission = {
        id: `MISSION_${orderId}_${Date.now()}`,
        orderId: orderId,
        droneId: selectedDrone.id,
        status: 'planned',
        route: route,
        packageInfo: packageInfo,
        priority: priority,
        estimatedTime: feasibility.estimatedTime,
        estimatedCost: feasibility.estimatedCost,
        createdAt: new Date(),
        waypoints: route.waypoints,
        weatherConditions: feasibility.weather,
        noFlyZoneCheck: 'passed'
      };

      // Store mission
      this.missions.set(mission.id, mission);
      
      // Update drone status
      selectedDrone.status = 'assigned';
      selectedDrone.currentMission = mission.id;

      console.log(`Drone delivery mission created: ${mission.id}`);
      
      return mission;
    } catch (error) {
      console.error('Error creating delivery mission:', error);
      throw error;
    }
  }

  // Select best drone for mission
  selectBestDrone(packageWeight, priority) {
    const availableDrones = this.getAvailableDrones(packageWeight);
    
    if (availableDrones.length === 0) {
      throw new Error('No available drones for this mission');
    }

    // Sort by suitability
    availableDrones.sort((a, b) => {
      // Prefer drones with higher battery
      const batteryDiff = (b.batteryLevel || 0) - (a.batteryLevel || 0);
      
      // Prefer drones with higher payload capacity
      const payloadDiff = b.maxPayload - a.maxPayload;
      
      // For high priority, prefer faster drones
      const speedDiff = priority === 'urgent' ? (b.maxSpeed - a.maxSpeed) : 0;
      
      return batteryDiff + payloadDiff + speedDiff;
    });

    return availableDrones[0];
  }

  // Start drone mission
  async startMission(missionId) {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        throw new Error('Mission not found');
      }

      const drone = this.drones.get(mission.droneId);
      if (!drone) {
        throw new Error('Drone not found');
      }

      // Update mission status
      mission.status = 'active';
      mission.startedAt = new Date();
      
      // Update drone status
      drone.status = 'in_flight';
      
      // Start real-time tracking
      this.startMissionTracking(missionId);
      
      console.log(`Drone mission started: ${missionId}`);
      
      return mission;
    } catch (error) {
      console.error('Error starting mission:', error);
      throw error;
    }
  }

  // Start mission tracking
  startMissionTracking(missionId) {
    const mission = this.missions.get(missionId);
    const drone = this.drones.get(mission.droneId);
    
    // Simulate real-time tracking
    const trackingInterval = setInterval(async () => {
      try {
        // Update drone position (mock)
        const currentWaypointIndex = mission.currentWaypointIndex || 0;
        const waypoints = mission.route.waypoints;
        
        if (currentWaypointIndex < waypoints.length - 1) {
          // Move to next waypoint
          mission.currentWaypointIndex = currentWaypointIndex + 1;
          mission.currentLocation = waypoints[mission.currentWaypointIndex];
          
          // Update drone location
          drone.location = mission.currentLocation;
          
          // Check if mission is complete
          if (mission.currentWaypointIndex === waypoints.length - 1) {
            await this.completeMission(missionId);
            clearInterval(trackingInterval);
          }
        }
      } catch (error) {
        console.error('Error in mission tracking:', error);
      }
    }, 5000); // Update every 5 seconds
    
    mission.trackingInterval = trackingInterval;
  }

  // Complete mission
  async completeMission(missionId) {
    try {
      const mission = this.missions.get(missionId);
      const drone = this.drones.get(mission.droneId);
      
      // Update mission status
      mission.status = 'completed';
      mission.completedAt = new Date();
      
      // Update drone status
      drone.status = 'available';
      drone.currentMission = null;
      
      // Clear tracking interval
      if (mission.trackingInterval) {
        clearInterval(mission.trackingInterval);
      }
      
      console.log(`Drone mission completed: ${missionId}`);
      
      return mission;
    } catch (error) {
      console.error('Error completing mission:', error);
      throw error;
    }
  }

  // Get mission status
  async getMissionStatus(missionId) {
    try {
      const mission = this.missions.get(missionId);
      if (!mission) {
        throw new Error('Mission not found');
      }

      const drone = this.drones.get(mission.droneId);
      
      return {
        mission: {
          id: mission.id,
          status: mission.status,
          progress: mission.currentWaypointIndex || 0,
          totalWaypoints: mission.route.waypoints.length,
          estimatedTime: mission.estimatedTime,
          actualTime: mission.completedAt ? 
            Math.round((mission.completedAt - mission.startedAt) / 60000) : null,
          currentLocation: mission.currentLocation,
          createdAt: mission.createdAt,
          startedAt: mission.startedAt,
          completedAt: mission.completedAt
        },
        drone: {
          id: drone.id,
          model: drone.model,
          batteryLevel: drone.batteryLevel,
          status: drone.status,
          location: drone.location
        }
      };
    } catch (error) {
      console.error('Error getting mission status:', error);
      throw error;
    }
  }

  // Get drone fleet status
  async getFleetStatus() {
    try {
      const fleetStatus = [];
      
      for (const [droneId, drone] of this.drones) {
        fleetStatus.push({
          id: drone.id,
          model: drone.model,
          status: drone.status,
          location: drone.location,
          batteryLevel: drone.batteryLevel || 0,
          currentMission: drone.currentMission,
          lastMaintenance: drone.lastMaintenance,
          certifications: drone.certifications,
          sensors: drone.sensors
        });
      }
      
      return {
        totalDrones: fleetStatus.length,
        available: fleetStatus.filter(d => d.status === 'available').length,
        inFlight: fleetStatus.filter(d => d.status === 'in_flight').length,
        maintenance: fleetStatus.filter(d => d.status === 'maintenance').length,
        drones: fleetStatus
      };
    } catch (error) {
      console.error('Error getting fleet status:', error);
      throw error;
    }
  }
}

module.exports = new DroneDeliveryService();
