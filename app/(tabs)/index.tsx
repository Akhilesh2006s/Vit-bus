import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,  Linking, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Bell, Search, Star, Info } from 'lucide-react-native';
import { useAuth } from '../(auth)/context/AuthContext';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    description: 'Track your bus with live GPS updates',
  },
  {
    icon: Clock,
    title: 'Live Schedule',
    description: 'Get accurate arrival times',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss your bus again',
  },
];

const popularRoutes = [
  { id: 'vv1', name: 'VV1', from: 'Main Bus Station', to: 'Benz Circle' },
  { id: 'vv2', name: 'VV2', from: 'Gannavaram Airport', to: 'Krishna University' },
  { id: 'vv3', name: 'VV3', from: 'Ibrahimpatnam', to: 'PVP Mall' },
];

function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>VIT-AP</Text>
          <Text style={styles.subtitle}>BUS TRACKING</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/bus-routes')}>
        <Search size={20} color="#64748B" />
        <Text style={styles.searchText}>Search for bus routes...</Text>
      </TouchableOpacity>

     

      {/* Popular Routes */}
      <View style={styles.popularRoutes}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FACC15" />
          <Text style={styles.sectionTitle}>Popular Routes</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routesScroll}>
          {popularRoutes.map(route => (
            <View key={route.id} style={styles.routeCard}>
              <Text style={styles.routeName}>{route.name}</Text>
              <View style={styles.routeDetails}>
                <Text style={styles.routeText}>{route.from}</Text>
                <Text style={{ marginHorizontal: 4 }}>➡️</Text>
                <Text style={styles.routeText}>{route.to}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Features Section */}
      <View style={styles.features}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#3366FF" />
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        </View>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <feature.icon size={24} color="#3366FF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <Image source={require('./bus.jpeg')} style={styles.cityImage} />

      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/bus-routes')}>
        <Text style={styles.exploreButtonText}>Explore All Routes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
  
  const team = [
    {
      name: 'Akhilesh S',
      regNo: '23BCE7426',
      role: 'FullStack & GitHub',
      image: require('../assets/images/akhilesh.png'),
      linkedin: 'https://www.linkedin.com/in/akhilesh-samayamanthula-60987b284',
      instagram: 'https://www.instagram.com/akhileshs26',
    },
    {
      name: 'Sravani D',
      regNo: '23BCE20083',
      role: 'Backend',
      image: require('../assets/images/sravani.png'),
      linkedin: 'https://www.linkedin.com/in/sravani-dasari-8b6ab42ba',
      instagram: 'https://www.instagram.com/sravsss._06',
    },
    {
      name: 'Lakshman Y',
      regNo: '23BCE8546',
      role: 'Frontend',
      image: require('../assets/images/lakshman.png'),
      linkedin: 'https://www.linkedin.com/in/lakshman-yalamanchili-00a937365',
      instagram: 'https://www.instagram.com/lakshman007',
    },
    {
      name: 'Sanjana P',
      regNo: '23BCE7338',
      role: 'Backend',
      image: require('../assets/images/sanjana.png'),
      linkedin: 'https://www.linkedin.com/in/sanjana-pasam-46029a367',
      instagram: 'https://www.instagram.com/.sannjuu',
    },
    {
      name: 'Manvika P',
      regNo: '23BEC7196',
      role: 'Frontend',
      image: require('../assets/images/manvika.png'),
      linkedin: 'https://www.linkedin.com/in/manvika-polavarapu-416582291',
      instagram: 'https://www.instagram.com/manvika_polavarapu',
    },
  ];
  
  const linkedinLogo = require('../assets/images/icons/linkedin.png');
  const instagramLogo = require('../assets/images/icons/instagram.png');
  
  function Index() {
    const openLink = async (url) => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Can't open URL:", url);
      }
    };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Explore Routes</Text>
  
        {team.map((member, index) => (
          <View key={index} style={styles.card}>
            <Image source={member.image} style={styles.avatar} />
  
            <View style={styles.details}>
              <Text style={styles.name}>{member.name}</Text>
              <Text>{member.regNo}</Text>
              <Text style={styles.role}>{member.role}</Text>
  
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => openLink(member.linkedin)}>
                  <Image source={linkedinLogo} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink(member.instagram)}>
                  <Image source={instagramLogo} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3A33A3',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -25,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#64748B',
  },
  cityImage: {
    width: '100%',
    height: 200,
    marginTop: 32,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#3366FF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  features: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  popularRoutes: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1E293B',
  },
  routesScroll: {
    paddingRight: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: width * 0.7,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 5,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
});

export default HomeScreen;
