// App.js
import React from 'react';
import 'react-native-gesture-handler';
import { Auth0Provider } from 'react-native-auth0';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { AuthProvider, ImageSelectionProvider } from './src/context/AuthContext' ;
// Ignore specific warnings that might be related to Auth0
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  console.log('App: Initializing with Auth0 configuration');
  
  return (
    <ImageSelectionProvider>
    <Auth0Provider 
      domain="dev-1de0bowjvfbbcx7q.us.auth0.com"
      clientId="rwah022fY6bSPr5gstiKqPAErQjgynT2"
    >
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </Auth0Provider>
    </ImageSelectionProvider>
  );
};

export default App;