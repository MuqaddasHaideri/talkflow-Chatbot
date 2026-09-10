
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  getSessionsApi,
  createSessionApi,
  getSessionMessagesApi,
  deleteSessionApi,
  streamChatMessageApi,
} from "../services/apiConfig";

import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";

import {
  Message,
  Session,
} from "../utils/chatTypes";

import {
  nowLabel,
  uid,
  shortenTitle,
  normalizeSession,
  normalizeMessage,
} from "../utils/chatHelpers";

// --------------------------------------------------
// THEME
// --------------------------------------------------

const NAVY = "#2A2C5E";
const ACCENT = "#E8C170";
const BG = "#F6F7FB";
const AI_BUBBLE = "#EDEEF4";
const WHITE = "#FFFFFF";
const TEXT = "#1E2432";
const MUTED = "#8D93A3";
const BORDER = "#E8E9EF";

const DRAWER_WIDTH = Math.min(
  310,
  Dimensions.get("window").width * 0.82
);

// --------------------------------------------------
// MAIN SCREEN
// --------------------------------------------------

export default function ChatScreen() {
  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [activeSessionId, setActiveSessionId] =
    useState<string | null>(null);

  const [input, setInput] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const drawerAnim =
    useRef(new Animated.Value(0)).current;

  const listRef =
    useRef<FlatList>(null);

  // ------------------------------------------------
  // ACTIVE SESSION
  // ------------------------------------------------

  const activeSession =
    sessions.find(
      (session) =>
        session.id ===
        activeSessionId
    );

  // ------------------------------------------------
  // DRAWER
  // ------------------------------------------------

  const toggleDrawer = (
    open: boolean
  ) => {
    setDrawerOpen(open);

    Animated.timing(drawerAnim, {
      toValue: open ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const drawerTranslateX =
    drawerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -DRAWER_WIDTH,
        0,
      ],
    });

  const overlayOpacity =
    drawerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

  // ------------------------------------------------
  // LOAD SESSIONS
  // ------------------------------------------------

  const loadSessions = async () => {
    try {
      setIsLoading(true);

      const response =
        await getSessionsApi();

      const rawSessions =
        Array.isArray(response)
          ? response
          : response?.sessions ||
            response?.data ||
            [];

      const normalized =
        rawSessions.map(
          normalizeSession
        );

      setSessions(normalized);

      if (normalized.length > 0) {
        setActiveSessionId(
          normalized[0].id
        );

        await loadMessages(
          normalized[0].id
        );
      }
    } catch (error: any) {
      console.log(
        "LOAD SESSIONS ERROR:",
        error
      );

      Alert.alert(
        "Unable to load chats",
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------
  // LOAD MESSAGES
  // ------------------------------------------------

  const loadMessages = async (
    sessionId: string
  ) => {
    try {
      const response =
        await getSessionMessagesApi(
          sessionId
        );

      const rawMessages =
        Array.isArray(response)
          ? response
          : response?.messages ||
            response?.data ||
            [];

      const messages =
        rawMessages.map(
          normalizeMessage
        );

      setSessions((previous) =>
        previous.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages,
              }
            : session
        )
      );
    } catch (error: any) {
      console.log(
        "LOAD MESSAGES ERROR:",
        error
      );

      Alert.alert(
        "Unable to load messages",
        error?.message ||
          "Could not load this conversation."
      );
    }
  };

  // ------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------

  useEffect(() => {
    loadSessions();
  }, []);

  // ------------------------------------------------
  // SELECT SESSION
  // ------------------------------------------------

  const handleSelectSession = async (
    sessionId: string
  ) => {
    setActiveSessionId(
      sessionId
    );

    toggleDrawer(false);

    await loadMessages(
      sessionId
    );
  };

  // ------------------------------------------------
  // CREATE SESSION
  // ------------------------------------------------

  const handleNewSession = async () => {
    try {
      const response =
        await createSessionApi(
          "New Chat"
        );

      const rawSession =
        response?.session ||
        response?.data ||
        response;

      const newSession =
        normalizeSession(
          rawSession
        );

      setSessions((previous) => [
        newSession,
        ...previous,
      ]);

      setActiveSessionId(
        newSession.id
      );

      setInput("");

      toggleDrawer(false);
    } catch (error: any) {
      console.log(
        "CREATE SESSION ERROR:",
        error
      );

      Alert.alert(
        "Could not create chat",
        error?.message ||
          "Something went wrong."
      );
    }
  };

  // ------------------------------------------------
  // DELETE SESSION
  // ------------------------------------------------

  const handleDeleteSession = (
    sessionId: string
  ) => {
    Alert.alert(
      "Delete conversation?",
      "This conversation will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteSessionApi(
                sessionId
              );

              const remaining =
                sessions.filter(
                  (session) =>
                    session.id !==
                    sessionId
                );

              setSessions(
                remaining
              );

              if (
                activeSessionId ===
                sessionId
              ) {
                if (
                  remaining.length >
                  0
                ) {
                  setActiveSessionId(
                    remaining[0].id
                  );

                  await loadMessages(
                    remaining[0].id
                  );
                } else {
                  setActiveSessionId(
                    null
                  );
                }
              }
            } catch (error: any) {
              Alert.alert(
                "Delete failed",
                error?.message ||
                  "Could not delete chat."
              );
            }
          },
        },
      ]
    );
  };

  // ------------------------------------------------
  // UPDATE MESSAGES
  // ------------------------------------------------

  const updateActiveMessages = (
    updater: (
      messages: Message[]
    ) => Message[]
  ) => {
    if (!activeSessionId) return;

    setSessions((previous) =>
      previous.map((session) =>
        session.id ===
        activeSessionId
          ? {
              ...session,
              messages:
                updater(
                  session.messages
                ),
            }
          : session
      )
    );
  };

  // ------------------------------------------------
  // STREAM CHAT
  // ------------------------------------------------

  const handleSend = async () => {
    const text =
      input.trim();

    if (
      !text ||
      !activeSessionId ||
      isSending
    ) {
      return;
    }

    const userMessage: Message = {
      id: uid(),
      role: "user",
      text,
      time: nowLabel(),
    };

    updateActiveMessages(
      (messages) => [
        ...messages,
        userMessage,
      ]
    );

    setSessions((previous) =>
      previous.map((session) =>
        session.id ===
          activeSessionId &&
        session.title ===
          "New Chat"
          ? {
              ...session,
              title:
                shortenTitle(text),
            }
          : session
      )
    );

    setInput("");
    setIsSending(true);
    setIsTyping(true);

    try {
      const response =
        await streamChatMessageApi(
          activeSessionId,
          text
        );

      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this response."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      const aiMessageId =
        uid();

      let aiText = "";

      updateActiveMessages(
        (messages) => [
          ...messages,
          {
            id: aiMessageId,
            role: "ai",
            text: "",
            time: nowLabel(),
          },
        ]
      );

      setIsTyping(false);

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) break;

        const chunk =
          decoder.decode(
            value,
            {
              stream: true,
            }
          );

        const cleaned =
          chunk
            .split("\n")
            .map((line) => {
              if (
                line.startsWith(
                  "data:"
                )
              ) {
                return line
                  .replace(
                    /^data:\s?/,
                    ""
                  )
                  .trim();
              }

              return line;
            })
            .filter(
              (line) =>
                line &&
                line !==
                  "[DONE]"
            )
            .join("\n");

        if (!cleaned) continue;

        aiText += cleaned;

        updateActiveMessages(
          (messages) =>
            messages.map(
              (message) =>
                message.id ===
                aiMessageId
                  ? {
                      ...message,
                      text: aiText,
                    }
                  : message
            )
        );
      }
    } catch (error: any) {
      console.log(
        "CHAT STREAM ERROR:",
        error
      );

      setIsTyping(false);

      updateActiveMessages(
        (messages) => [
          ...messages,
          {
            id: uid(),
            role: "ai",
            text:
              "Sorry, I couldn't process that message. Please try again.",
            time: nowLabel(),
          },
        ]
      );
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  // ------------------------------------------------
  // AUTO SCROLL
  // ------------------------------------------------

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, [
    activeSession?.messages.length,
    isTyping,
  ]);

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.loadingScreen}
        >
          <View style={styles.logoCircle}>
            <Ionicons
              name="sparkles"
              size={28}
              color={ACCENT}
            />
          </View>

          <Text
            style={styles.loadingTitle}
          >
            TalkFlow
          </Text>

          <Text
            style={styles.loadingSubtitle}
          >
            Loading your conversations...
          </Text>

          <ActivityIndicator
            size="small"
            color={NAVY}
            style={{
              marginTop: 20,
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            toggleDrawer(true)
          }
        >
          <Ionicons
            name="menu-outline"
            size={25}
            color={NAVY}
          />
        </TouchableOpacity>

        <View
          style={styles.headerCenter}
        >
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {activeSession?.title ||
              "TalkFlow"}
          </Text>

          <View
            style={styles.statusRow}
          >
            <View
              style={styles.statusDot}
            />

            <Text
              style={styles.statusText}
            >
              AI assistant
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.headerButton,
            styles.newHeaderButton,
          ]}
          onPress={
            handleNewSession
          }
        >
          <Ionicons
            name="add"
            size={23}
            color={NAVY}
          />
        </TouchableOpacity>
      </View>

      {/* CHAT */}

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? 90
            : 0
        }
      >
        {activeSession ? (
          <FlatList
            ref={listRef}
            data={
              activeSession.messages
            }
            keyExtractor={(item) =>
              item.id
            }
            renderItem={({
              item,
            }) => (
              <MessageBubble
                message={item}
              />
            )}
            contentContainerStyle={
              styles.messagesContent
            }
            ListEmptyComponent={
              <View
                style={
                  styles.emptyChat
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="sparkles"
                    size={30}
                    color={NAVY}
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  What can I help with?
                </Text>

                <Text
                  style={
                    styles.emptySubtitle
                  }
                >
                  Ask me anything and
                  let's figure it out
                  together.
                </Text>
              </View>
            }
            ListFooterComponent={
              isTyping ? (
                <TypingIndicator />
              ) : null
            }
            showsVerticalScrollIndicator={
              false
            }
          />
        ) : (
          <View
            style={styles.noSession}
          >
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={30}
                color={NAVY}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              Start a conversation
            </Text>

            <TouchableOpacity
              style={
                styles.startButton
              }
              onPress={
                handleNewSession
              }
            >
              <Ionicons
                name="add"
                size={19}
                color={WHITE}
              />

              <Text
                style={
                  styles.startButtonText
                }
              >
                New Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT */}

        <View
          style={styles.inputContainer}
        >
          <View
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Message TalkFlow..."
              placeholderTextColor="#9AA0AC"
              value={input}
              onChangeText={
                setInput
              }
              multiline
              maxLength={4000}
              editable={
                !isSending &&
                !!activeSession
              }
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() ||
                  isSending ||
                  !activeSession) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={
                handleSend
              }
              disabled={
                !input.trim() ||
                isSending ||
                !activeSession
              }
            >
              {isSending ? (
                <ActivityIndicator
                  size="small"
                  color={WHITE}
                />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={WHITE}
                />
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={styles.inputHint}
          >
            TalkFlow can make mistakes.
            Check important information.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* OVERLAY */}

      {drawerOpen && (
        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={() =>
            toggleDrawer(false)
          }
        >
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity:
                  overlayOpacity,
              },
            ]}
          />
        </Pressable>
      )}

      {/* DRAWER */}

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [
              {
                translateX:
                  drawerTranslateX,
              },
            ],
          },
        ]}
      >
        <SafeAreaView
          style={styles.flexOne}
        >
          <View
            style={styles.drawerHeader}
          >
            <View>
              <Text
                style={
                  styles.drawerTitle
                }
              >
                Conversations
              </Text>

              <Text
                style={
                  styles.drawerSubtitle
                }
              >
                {sessions.length}{" "}
                {sessions.length ===
                1
                  ? "chat"
                  : "chats"}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={() =>
                toggleDrawer(false)
              }
            >
              <Ionicons
                name="close"
                size={22}
                color={NAVY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={
              handleNewSession
            }
          >
            <View
              style={
                styles.newChatIcon
              }
            >
              <Ionicons
                name="add"
                size={20}
                color={NAVY}
              />
            </View>

            <View
              style={
                styles.newChatTextContainer
              }
            >
              <Text
                style={
                  styles.newChatTitle
                }
              >
                New conversation
              </Text>

              <Text
                style={
                  styles.newChatSubtitle
                }
              >
                Start something new
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={MUTED}
            />
          </TouchableOpacity>

          <Text
            style={styles.sectionLabel}
          >
            RECENT CHATS
          </Text>

          <FlatList
            data={sessions}
            keyExtractor={(item) =>
              item.id
            }
            contentContainerStyle={{
              paddingBottom: 30,
            }}
            ListEmptyComponent={
              <View
                style={
                  styles.drawerEmpty
                }
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={30}
                  color="#B4B8C5"
                />

                <Text
                  style={
                    styles.drawerEmptyTitle
                  }
                >
                  No conversations yet
                </Text>
              </View>
            }
            renderItem={({
              item,
            }) => {
              const isActive =
                item.id ===
                activeSessionId;

              const preview =
                item.messages[
                  item.messages
                    .length - 1
                ]?.text || "";

              return (
                <TouchableOpacity
                  style={[
                    styles.sessionItem,
                    isActive &&
                      styles.sessionItemActive,
                  ]}
                  onPress={() =>
                    handleSelectSession(
                      item.id
                    )
                  }
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.sessionIcon,
                      isActive &&
                        styles.sessionIconActive,
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={17}
                      color={
                        isActive
                          ? NAVY
                          : MUTED
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.sessionContent
                    }
                  >
                    <Text
                      style={[
                        styles.sessionTitle,
                        isActive &&
                          styles.sessionTitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={
                        styles.sessionPreview
                      }
                      numberOfLines={1}
                    >
                      {preview ||
                        "No messages yet"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      handleDeleteSession(
                        item.id
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#A5A9B5"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Animated.View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  flexOne: {
    flex: 1,
  },

  // HEADER

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  newHeaderButton: {
    backgroundColor: "#F1F2F7",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    maxWidth: "85%",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },

  statusText: {
    fontSize: 10.5,
    color: MUTED,
    fontWeight: "500",
  },

  // MESSAGES

  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 18,
    flexGrow: 1,
  },

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

  // TYPING

  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
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

  // EMPTY STATE

  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingTop: 80,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#E7E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
    marginTop: 8,
  },

  noSession: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  startButton: {
    marginTop: 22,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  startButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 14,
  },

  // INPUT

  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom:
      Platform.OS === "ios"
        ? 8
        : 10,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F1F2F6",
    borderRadius: 23,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5,
    minHeight: 52,
  },

  textInput: {
    flex: 1,
    maxHeight: 115,
    minHeight: 40,
    paddingTop: 9,
    paddingBottom: 9,
    paddingRight: 8,
    fontSize: 14.5,
    color: TEXT,
    lineHeight: 20,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#C8CAD4",
  },

  inputHint: {
    textAlign: "center",
    fontSize: 9.5,
    color: "#A4A8B4",
    marginTop: 7,
  },

  // DRAWER

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(12,14,30,0.45)",
  },

  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: WHITE,

    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 0,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,

    elevation: 15,
  },

  drawerHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  drawerSubtitle: {
    fontSize: 11.5,
    color: MUTED,
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F2F6",
    alignItems: "center",
    justifyContent: "center",
  },

  newChatButton: {
    marginHorizontal: 14,
    padding: 11,
    borderRadius: 16,
    backgroundColor: "#F4F3F8",
    flexDirection: "row",
    alignItems: "center",
  },

  newChatIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },

  newChatTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  newChatTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: TEXT,
  },

  newChatSubtitle: {
    fontSize: 10.5,
    color: MUTED,
    marginTop: 2,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#A0A4B2",
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 8,
  },

  sessionItem: {
    marginHorizontal: 9,
    marginVertical: 2,
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  sessionItemActive: {
    backgroundColor:
      "rgba(232,193,112,0.18)",
  },

  sessionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#F3F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionIconActive: {
    backgroundColor: ACCENT,
  },

  sessionContent: {
    flex: 1,
    marginLeft: 10,
  },

  sessionTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: TEXT,
  },

  sessionTitleActive: {
    color: NAVY,
    fontWeight: "750",
  },

  sessionPreview: {
    fontSize: 10.5,
    color: MUTED,
    marginTop: 3,
  },

  deleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  drawerEmpty: {
    alignItems: "center",
    paddingTop: 60,
  },

  drawerEmptyTitle: {
    marginTop: 10,
    color: MUTED,
    fontSize: 13,
  },



  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: TEXT,
    marginTop: 15,
  },

  loadingSubtitle: {
    fontSize: 12.5,
    color: MUTED,
    marginTop: 5,
  },
});

