import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MapPin, Clock, Users, X } from "lucide-react-native";
import { WebView } from 'react-native-webview';

// Mock data for different routes
const routeData = {
  vv1: {
    title: "VV1 Bus Route",
    description: "Main Bus Station to Benz Circle via MG Road",
    stops: ["Main Bus Station", "Governorpet", "Raghavaiah Park", "Benz Circle"],
    schedule: [
      { time: "06:00 AM", status: "On Time" },
      { time: "07:30 AM", status: "On Time" },
      { time: "09:00 AM", status: "Delayed by 5m" },
      { time: "10:30 AM", status: "On Time" },
    ],
    occupancy: "Medium",
    coordinates: {
      center: [78.4867, 17.3850],
      stops: [
        [78.4867, 17.3850],
        [78.4900, 17.3880],
        [78.4930, 17.3900],
        [78.4960, 17.3920]
      ]
    }
  },
  // Add more routes as needed...
};

const defaultRouteData = {
  title: "Bus Route Information",
  description: "Route information not available",
  stops: ["Stop information not available"],
  schedule: [{ time: "Schedule not available", status: "Unknown" }],
  occupancy: "Unknown",
  coordinates: {
    center: [78.4867, 17.3850],
    stops: [[78.4867, 17.3850]]
  }
};

export default function BusRouteScreen() {
  const { routeId } = useLocalSearchParams();
  const [data, setData] = useState(defaultRouteData);
  const webViewRef = useRef(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const routeKey = routeId?.toString().toLowerCase() || "";
    const routeInfo = routeData[routeKey as keyof typeof routeData] || defaultRouteData;
    setData(routeInfo);
  }, [routeId]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css' rel='stylesheet' />
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        html, body, #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        mapboxgl.accessToken = 'pk.eyJ1IjoiZ25hbmFzYWkxMjMiLCJhIjoiY204Mzh4NmphMGdhNDJscXZmd2pnb3ZrOCJ9.Cp-WLG0aK9wVlbTEUBaItA';
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [${data.coordinates.center}],
          zoom: 13
        });

        // Add markers for all stops
        ${data.coordinates.stops.map((coord, index) => `
          new mapboxgl.Marker()
            .setLngLat([${coord}])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>${data.stops[index]}</h3>'))
            .addTo(map);
        `).join('')}

        // Update bus location
        let currentMarker = new mapboxgl.Marker({ color: '#3366FF' });

        function updateBusLocation() {
          fetch("https://git-backend-1-production.up.railway.app/get_location")
            .then(response => response.json())
            .then(data => {
              if (data.lat && data.lon) {
                currentMarker.setLngLat([data.lon, data.lat]).addTo(map);
                map.setCenter([data.lon, data.lat]);
              }
            })
            .catch(error => console.error("Error:", error));
        }

        updateBusLocation();
        setInterval(updateBusLocation, 5000);
        
        // This helps the map resize properly when expanded/collapsed
        window.addEventListener('resize', () => {
          map.resize();
        });
        
        // Function that can be called from React Native
        window.resizeMap = function() {
          setTimeout(() => {
            map.resize();
            map.invalidateSize(); // For backup
          }, 300);
        }
        
        // Force map to render properly on initial load
        setTimeout(() => {
          map.resize();
          if (map) map.invalidateSize && map.invalidateSize(true);
        }, 500);
      </script>
    </body>
    </html>
  `;

  // Function to ensure map is resized properly when expanded
  const handleMapResize = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.resizeMap(); true;');
    }
  };

  // Toggle map expansion
  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded);
    // Give the modal time to render before resizing the map
    setTimeout(handleMapResize, 300);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.description}>{data.description}</Text>
      </View>

      <TouchableOpacity 
        style={styles.mapContainer} 
        activeOpacity={0.9}
        onPress={toggleMapExpansion}
      >
                  <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Tap to expand</Text>
        </View>
      </TouchableOpacity>

      {/* Full-screen Map Modal */}
      <Modal
        visible={mapExpanded}
        animationType="fade"
        transparent={false}
        onRequestClose={toggleMapExpansion}
      >
        <View style={styles.expandedMapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={styles.expandedMap}
            onLoad={handleMapResize}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={toggleMapExpansion}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <MapPin size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Bus Stops</Text>
        </View>
        <View style={styles.stopsContainer}>
          {data.stops.map((stop, index) => (
            <View key={index} style={styles.stopItem}>
              <View style={styles.stopDot} />
              <Text style={styles.stopText}>{stop}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Clock size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Schedule</Text>
        </View>
        <View style={styles.scheduleContainer}>
          {data.schedule.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text 
                style={[
                  styles.scheduleStatus, 
                  { color: item.status.includes("Delayed") ? "#F59E0B" : "#10B981" }
                ]}
              >
                {item.status}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Users size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Current Occupancy</Text>
        </View>
        <View style={styles.occupancyContainer}>
          <View 
            style={[
              styles.occupancyIndicator,
              { 
                backgroundColor: 
                  data.occupancy === "High" ? "#EF4444" : 
                  data.occupancy === "Medium" ? "#F59E0B" : 
                  data.occupancy === "Low" ? "#10B981" : "#94A3B8" 
              }
            ]} 
          />
          <Text style={styles.occupancyText}>{data.occupancy}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#64748B",
  },
  mapContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  map: {
    flex: 1,
  },
  expandedMapContainer: {
    flex: 1,
    position: 'relative',
  },
  expandedMap: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginLeft: 8,
  },
  stopsContainer: {
    paddingLeft: 4,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3366FF",
    marginRight: 12,
  },
  stopText: {
    fontSize: 16,
    color: "#1E293B",
  },
  scheduleContainer: {
    paddingLeft: 4,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  scheduleTime: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  scheduleStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  occupancyContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
  },
  occupancyIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  occupancyText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
});