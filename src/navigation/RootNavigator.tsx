import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AssessmentScreen } from '../screens/AssessmentScreen';
import { GapsScreen } from '../screens/GapsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LegalScreen } from '../screens/LegalScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { ScoringScreen } from '../screens/ScoringScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { color } from '../theme/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        contentStyle: { backgroundColor: color.canvas },
      }}
    >
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="setup" component={SetupScreen} />
      <Stack.Screen name="assessment" component={AssessmentScreen} />
      <Stack.Screen name="scoring" component={ScoringScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="results" component={ResultsScreen} />
      <Stack.Screen name="gaps" component={GapsScreen} />
      <Stack.Screen name="report" component={ReportScreen} />
      <Stack.Screen name="legal" component={LegalScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
