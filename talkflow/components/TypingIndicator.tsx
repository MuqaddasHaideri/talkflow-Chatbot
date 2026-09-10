import React, {
    useEffect,
    useRef,
  } from "react";
  
  import {
    View,
    Animated,
    StyleSheet,
  } from "react-native";
  
  import { Ionicons } from "@expo/vector-icons";
  
  const NAVY = "#2A2C5E";
  const AI_BUBBLE = "#EDEEF4";
  
  const TypingIndicator = () => {
    const dot1 =
      useRef(new Animated.Value(0)).current;
  
    const dot2 =
      useRef(new Animated.Value(0)).current;
  
    const dot3 =
      useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const animate = (
        value: Animated.Value,
        delay: number
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
  
            Animated.timing(value, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
  
            Animated.timing(value, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ])
        );
      };
  
      const animations = [
        animate(dot1, 0),
        animate(dot2, 120),
        animate(dot3, 240),
      ];
  
      animations.forEach((animation) =>
        animation.start()
      );
  
      return () => {
        animations.forEach((animation) =>
          animation.stop()
        );
      };
    }, []);
  
    const dots = [
      dot1,
      dot2,
      dot3,
    ];
  
    return (
      <View style={styles.typingRow}>
        <View style={styles.aiAvatar}>
          <Ionicons
            name="sparkles"
            size={15}
            color={NAVY}
          />
        </View>
  
        <View style={styles.typingBubble}>
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  opacity:
                    dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        0.3,
                        1,
                      ],
                    }),
  
                  transform: [
                    {
                      translateY:
                        dot.interpolate({
                          inputRange: [
                            0,
                            1,
                          ],
                          outputRange: [
                            0,
                            -3,
                          ],
                        }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };
  
  export default TypingIndicator;
  
  const styles = StyleSheet.create({
    typingRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 14,
    },
  
    aiAvatar: {
      width: 29,
      height: 29,
      borderRadius: 10,
      backgroundColor: "#E5E6EF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 7,
    },
  
    typingBubble: {
      height: 40,
      minWidth: 65,
      borderRadius: 18,
      borderBottomLeftRadius: 5,
      backgroundColor: AI_BUBBLE,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#9095A5",
      marginHorizontal: 3,
    },
  });