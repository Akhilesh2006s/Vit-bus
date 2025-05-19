import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MapPin, Clock, Users, X } from "lucide-react-native";
import { WebView } from "react-native-webview";

// Sample data for different bus routes
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
  // Add other routes here
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

  useEffect(() => {
    const routeKey = routeId?.toString().toLowerCase() || "";
    setData(routeData[routeKey] || defaultRouteData);
  }, [routeId]);

  // Mapbox HTML with embedded map and markers for stops and current bus location
  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css' rel='stylesheet' />
    <style>
      body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
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

      // Add markers for bus stops
      ${data.coordinates.stops.map((coord, i) => `
        new mapboxgl.Marker()
          .setLngLat([${coord}])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>${data.stops[i]}</h3>'))
          .addTo(map);
      `).join('')}

      // Marker for current bus location
      let currentMarker = new mapboxgl.Marker({ color: '#3366FF' });

      function updateBusLocation() {
        fetch("https://git-backend-1-production.up.railway.app/get_location")
          .then(res => res.json())
          .then(loc => {
            if(loc.lat && loc.lon) {
              currentMarker.setLngLat([loc.lon, loc.lat]).addTo(map);
              map.setCenter([loc.lon, loc.lat]);
            }
          })
          .catch(console.error);
      }

      updateBusLocation();
      setInterval(updateBusLocation, 5000);

      window.addEventListener('resize', () => { map.resize(); });

      window.resizeMap = function() {
        setTimeout(() => {
          map.resize();
          if(map.invalidateSize) map.invalidateSize();
        }, 300);
      }

      setTimeout(() => {
        map.resize();
        if(map.invalidateSize) map.invalidateSize(true);
      }, 500);
    </script>
  </body>
  </html>
  `;

  const handleMapResize = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.resizeMap(); true;');
    }
  };

  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded);
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
          javaScriptEnabled
          domStorageEnabled
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Tap to expand</Text>
        </View>
      </TouchableOpacity>

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
            javaScriptEnabled
            domStorageEnabled
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
          {data.stops.map((stop, i) => (
            <View key={i} style={styles.stopItem}>
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
          {data.schedule.map((item, i) => (
            <View key={i} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={[
                styles.scheduleStatus, 
                { color: item.status.includes("Delayed") ? "#F59E0B" : "#10B981" }
              ]}>
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
          <View style={[
            styles.occupancyIndicator,
            { backgroundColor: 
              data.occupancy === "High" ? "#EF4444" : 
              data.occupancy === "Medium" ? "#F59E0B" : 
              data.occupancy === "Low" ? "#10B981" : "#94A3B8" 
            }
          ]} />
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
    marginTop: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#475569",
  },
  mapContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 16,
},
mapOverlayText: {
color: "#FFF",
fontSize: 12,
},
expandedMapContainer: {
flex: 1,
},
expandedMap: {
flex: 1,
},
closeButton: {
position: "absolute",
top: 40,
right: 20,
backgroundColor: "rgba(0,0,0,0.6)",
padding: 12,
borderRadius: 24,
},
infoCard: {
marginHorizontal: 16,
marginTop: 24,
backgroundColor: "#FFFFFF",
borderRadius: 12,
padding: 16,
shadowColor: "#000",
shadowOpacity: 0.05,
shadowRadius: 10,
shadowOffset: { width: 0, height: 4 },
elevation: 3,
},
cardHeader: {
flexDirection: "row",
alignItems: "center",
marginBottom: 12,
},
cardTitle: {
fontSize: 18,
fontWeight: "600",
color: "#1E293B",
marginLeft: 8,
},
stopsContainer: {
marginLeft: 8,
},
stopItem: {
flexDirection: "row",
alignItems: "center",
marginVertical: 4,
},
stopDot: {
width: 8,
height: 8,
borderRadius: 4,
backgroundColor: "#3366FF",
marginRight: 12,
},
stopText: {
fontSize: 16,
color: "#334155",
},
scheduleContainer: {},
scheduleItem: {
flexDirection: "row",
justifyContent: "space-between",
marginVertical: 4,
},
scheduleTime: {
fontSize: 16,
color: "#334155",
},
scheduleStatus: {
fontSize: 16,
fontWeight: "600",
},
occupancyContainer: {
flexDirection: "row",
alignItems: "center",
},
occupancyIndicator: {
width: 16,
height: 16,
borderRadius: 8,
marginRight: 12,
},
occupancyText: {
fontSize: 16,
color: "#334155",
fontWeight: "600",
},
});

