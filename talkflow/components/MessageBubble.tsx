import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Message } from "../utils/chatTypes";

const NAVY = "#2A2C5E";
const AI_BUBBLE = "#EDEEF4";
const WHITE = "#FFFFFF";
const TEXT = "#1E2432";

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({
  message,
}) => {
  const isUser =
    message.role === "user";

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

  bubble: {
    maxWidth: "78%",
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
});