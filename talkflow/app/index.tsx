if (__DEV__) {
  require("../reactotron");
}
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signupUserApi, loginUserApi } from '../services/apiConfig';
import { router } from 'expo-router';
import { useAppDispatch } from "../redux/hooks";
import { login } from "../redux/auth";
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  // Form states separated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const handleFlip = () => {
    const toValue = isLogin ? 1 : 0;
    setIsLogin(!isLogin);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = async () => {
    if (!signupUsername || !signupEmail || !signupPassword) return;
    try {
      setLoading(true);
      const response = await signupUserApi(signupUsername, signupEmail, signupPassword);
    } catch (error) {
      console.error(error); 
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async () => {
    console.log(loginEmail, loginPassword);
    if (!loginEmail || !loginPassword) return;
    try {
      setLoading(true);
      const response = await loginUserApi(loginEmail, loginPassword);
    const token = response.token;
    const user = response?.username;
    dispatch(
      login({
        token,
        user,
      })
    );
      router.push('/home');
    }
    catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
              {/* FRONT: Login */}
              <Animated.View
                pointerEvents={isLogin ? 'auto' : 'none'}
                style={[
                  styles.card,
                  styles.cardFace,
                  {
                    opacity: frontOpacity,
                    transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
                  },
                ]}
              >
                <View style={styles.formContent}>
                  <Text style={styles.heading}>Welcome,</Text>
                  <Text style={styles.subHeading}>Sign in to continue!</Text>

                  <FloatingInput
                    label="Email or Username"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                  />
                  <FloatingInput
                    label="Password"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity style={styles.forgotPassBtn}>
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtnWrapper}
                  onPress={handleLogin}
                  >
                    <LinearGradient
                      colors={['#393B73', '#2A2C5E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryBtnGradient}
                    >
                      <Text style={styles.primaryBtnText}>Login</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>I'm a new user, </Text>
                  <TouchableOpacity onPress={handleFlip}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* BACK: Sign Up */}
              <Animated.View
                pointerEvents={isLogin ? 'none' : 'auto'}
                style={[
                  styles.card,
                  styles.cardFace,
                  {
                    opacity: backOpacity,
                    transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
                  },
                ]}
              >
                <View style={styles.formContent}>
                  <Text style={styles.heading}>Create Account,</Text>
                  <Text style={styles.subHeading}>Sign up to get started!</Text>

                  <FloatingInput
                    label="Username"
                    value={signupUsername}
                    onChangeText={setSignupUsername}
                    autoCapitalize="words"
                  />
                  <FloatingInput
                    label="Email"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    keyboardType="email-address"
                  />
                  <FloatingInput
                    label="Password"
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.primaryBtnWrapper}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#393B73', '#2A2C5E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryBtnGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Sign Up</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>I'm already a member, </Text>
                  <TouchableOpacity onPress={handleFlip}>
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
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  flipContainer: {
    width: '100%',
    maxWidth: 390,
    minHeight: 560,
    position: 'relative',
  },
  card: {
    width: '100%',
    minHeight: 560,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 40,
    paddingBottom: 28,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
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
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 28,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 18,
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
    marginBottom: 24,
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
    shadowColor: '#2A2C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#374151',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E7E',
  }
});