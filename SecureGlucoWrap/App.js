import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading SecureGluco...</Text>
        </View>
      )}

      <WebView
        source={{ uri: 'https://secure-gluco.vercel.app/' }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555'
  }
});
