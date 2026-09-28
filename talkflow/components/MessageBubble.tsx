import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";

import { Message } from "../utils/chatTypes";

const NAVY = "#2A2C5E";
const AI_BUBBLE = "#EDEEF4";
const WHITE = "#FFFFFF";
const TEXT = "#1E2432";
const MUTED = "#8D93A3";
const SUCCESS = "#4CAF50";

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({
  message,
}) => {
  const isUser =
    message.role === "user";

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const copiedTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      if (isSpeaking) {
        Speech.stop();
      }
    };

  }, []);

  const handleCopy = async () => {
    if (!message.text) return;

    try {
      await Clipboard.setStringAsync(message.text);

      setCopied(true);

      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.log("COPY ERROR:", error);
    }
  };

  const handleToggleSpeak = () => {
    if (!message.text) return;

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    Speech.stop();

    setIsSpeaking(true);

    Speech.speak(message.text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isUser
          ? styles.messageRight
          : styles.messageLeft,
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons
            name="sparkles"
            size={15}
            color={NAVY}
          />
        </View>
      )}

      <View style={styles.column}>
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.bubbleUser
              : styles.bubbleAi,
          ]}
        >
          <Text
            style={
              isUser
                ? styles.bubbleTextUser
                : styles.bubbleTextAi
            }
          >
            {message.text}
          </Text>

          <Text
            style={[
              styles.messageTime,
              isUser &&
                styles.messageTimeUser,
            ]}
          >
            {message.time}
          </Text>
        </View>

        {!isUser && !!message.text && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopy}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={14}
                color={copied ? SUCCESS : MUTED}
              />

              <Text
                style={[
                  styles.actionText,
                  copied && { color: SUCCESS },
                ]}
              >
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleSpeak}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={
                  isSpeaking
                    ? "stop-circle-outline"
                    : "volume-medium-outline"
                }
                size={14}
                color={isSpeaking ? NAVY : MUTED}
              />

              <Text
                style={[
                  styles.actionText,
                  isSpeaking && { color: NAVY },
                ]}
              >
                {isSpeaking ? "Stop" : "Listen"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default MessageBubble;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },

  messageLeft: {
    justifyContent: "flex-start",
  },

  messageRight: {
    justifyContent: "flex-end",
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

  column: {
    maxWidth: "78%",
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 8,
  },

  bubbleUser: {
    backgroundColor: NAVY,
    borderBottomRightRadius: 5,
  },

  bubbleAi: {
    backgroundColor: AI_BUBBLE,
    borderBottomLeftRadius: 5,
  },

  bubbleTextUser: {
    color: WHITE,
    fontSize: 14.5,
    lineHeight: 21,
  },

  bubbleTextAi: {
    color: TEXT,
    fontSize: 14.5,
    lineHeight: 21,
  },

  messageTime: {
    fontSize: 9.5,
    color: "#9B9FAC",
    marginTop: 5,
    alignSelf: "flex-end",
  },

  messageTimeUser: {
    color: "rgba(255,255,255,0.6)",
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 5,
    marginLeft: 4,
    gap: 14,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  actionText: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
  },
});
