import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ---------- Floating Label Outline Input ----------
interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}
const BACKGROUND_IMAGE = require('../assets/images/background.jpg');
const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <View style={styles.floatingLabelBadge}>
        <Text style={[styles.floatingLabelText, isFocused && styles.floatingLabelTextFocused]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

// ---------- Auth Screen ----------
export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 0 -> showing front (Login), 1 -> showing back (Sign Up)
  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  // Front fades/disables exactly at the halfway point so taps land on the
  // correct face and neither side is tappable edge-on.
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.50001, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49999, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    const toValue = isLogin ? 1 : 0;
    Animated.timing(flipAnim, {
      toValue,
      duration: 650,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
      setIsFlipping(false);
    });
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.flipContainer}>
              {/* FRONT — Login */}
              <Animated.View
                pointerEvents={isLogin ? 'auto' : 'none'}
                style={[
                  styles.card,
                  styles.cardFace,
                  {
                    opacity: frontOpacity,
                    transform: [{ perspective: 1200 }, { rotateY: frontRotateY }],
                  },
                ]}
              >
                <View style={styles.formContent}>
                  <Text style={styles.heading}>Welcome,</Text>
                  <Text style={styles.subHeading}>Sign in to continue!</Text>

                  <FloatingInput
                    label="Email ID"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                  <FloatingInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity style={styles.forgotPassBtn}>
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtnWrapper}>
                    <LinearGradient
                      colors={['#2A2C5E', '#2A2C5E']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.primaryBtnGradient}
                    >
                      <Text style={styles.primaryBtnText}>Login</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>I'm a new user, </Text>
                  <TouchableOpacity onPress={handleFlip} disabled={isFlipping}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* BACK — Sign Up */}
              <Animated.View
                pointerEvents={isLogin ? 'none' : 'auto'}
                style={[
                  styles.card,
                  styles.cardFace,
                  styles.cardBack,
                  {
                    opacity: backOpacity,
                    transform: [{ perspective: 1200 }, { rotateY: backRotateY }],
                  },
                ]}
              >
                <View style={styles.formContent}>
                  <Text style={styles.heading}>Create Account,</Text>
                  <Text style={styles.subHeading}>Sign up to get started!</Text>

                  <FloatingInput
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                  <FloatingInput
                    label="Email ID"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                  <FloatingInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.primaryBtnWrapper, { marginTop: 6 }]}
                  >
                    <LinearGradient
                      colors={['#2A2C5E', '#2A2C5E']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.primaryBtnGradient}
                    >
                      <Text style={styles.primaryBtnText}>Sign Up</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>I'm already a member, </Text>
                  <TouchableOpacity onPress={handleFlip} disabled={isFlipping}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const CARD_HEIGHT = 680;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  safeArea: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  flipContainer: {
    width: '100%',
    maxWidth: 390,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 48,
    paddingBottom: 28,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  // Both faces stack in the same spot; rotateY + backfaceVisibility does the flip.
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    // Starts pre-rotated so it faces away until the animation brings it around.
  },
  formContent: {
    width: '100%',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E2432',
    letterSpacing: -0.3,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperFocused: {
    borderColor: '#FF5E7E',
  },
  textInput: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 0,
  },
  floatingLabelBadge: {
    position: 'absolute',
    top: -9,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  floatingLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AAB8',
  },
  floatingLabelTextFocused: {
    color: '#FF5E7E',
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 26,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#263238',
  },
  primaryBtnWrapper: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#FF5E7E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  facebookBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#EDF1F7',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fbIconBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#3B5998',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: -1,
  },
  facebookBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344767',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#374151',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E7E',
  },
});