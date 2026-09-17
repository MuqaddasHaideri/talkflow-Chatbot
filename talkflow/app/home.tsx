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
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  getSessionsApi,
  createSessionApi,
  getSessionMessagesApi,
  deleteSessionApi,
  streamChatMessageApi,
  updateSessionTitleApi,
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

const NAVY = "#2A2C5E";
const NAVY_DARK = "#1D1E45";
const ACCENT = "#E8C170";
const ACCENT_DARK = "#D9AE4F";
const BG = "#F6F7FB";
const AI_BUBBLE = "#EEEFF5";
const WHITE = "#FFFFFF";
const TEXT = "#1E2432";
const MUTED = "#8D93A3";
const BORDER = "#EBECF2";
const DANGER = "#E4574C";

const DRAWER_WIDTH = Math.min(
  310,
  Dimensions.get("window").width * 0.84
);

const DRAWER_ANIM_MS = 260;


type ChatScreenProps = {

  onLogout?: () => Promise<void> | void;
  userName?: string;
  userEmail?: string;
};

export default function ChatScreen({
  onLogout,
  userName = "You",
  userEmail,
}: ChatScreenProps) {
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

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [drawerVisible, setDrawerVisible] =
    useState(false);

  const drawerAnim =
    useRef(new Animated.Value(0)).current;

  const listRef =
    useRef<FlatList>(null);


  const abortControllerRef =
    useRef<AbortController | null>(null);

  // ------------------------------------------------
  // ACTIVE SESSION
  // ------------------------------------------------

  const activeSession =
    sessions.find(
      (session) =>
        session.id ===
        activeSessionId
    );

  const activeMessages: Message[] =
    activeSession?.messages || [];

  // ------------------------------------------------
  // DRAWER
  // ------------------------------------------------

  const toggleDrawer = (open: boolean) => {
    if (open) {
      setDrawerVisible(true);
    }

    setDrawerOpen(open);

    Animated.timing(drawerAnim, {
      toValue: open ? 1 : 0,
      duration: DRAWER_ANIM_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) {
        setDrawerVisible(false);
      }
    });
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
        rawSessions.map((raw: any) => ({
          ...normalizeSession(raw),
          messages:
            normalizeSession(raw).messages || [],
        }));

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

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ------------------------------------------------
  // SELECT SESSION
  // ------------------------------------------------

  const handleSelectSession = async (
    sessionId: string
  ) => {
    if (sessionId === activeSessionId) {
      toggleDrawer(false);
      return;
    }

    abortControllerRef.current?.abort();

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

      const newSession = {
        ...normalizeSession(rawSession),
        messages: [],
      };

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

              if (activeSessionId === sessionId) {
                abortControllerRef.current?.abort();
              }

              setSessions((previous) => {
                const remaining = previous.filter(
                  (session) => session.id !== sessionId
                );

                if (activeSessionId === sessionId) {
                  if (remaining.length > 0) {
                    setActiveSessionId(remaining[0].id);
                    loadMessages(remaining[0].id);
                  } else {
                    setActiveSessionId(null);
                  }
                }

                return remaining;
              });
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
  // LOGOUT
  // ------------------------------------------------

  const handleLogout = () => {
    Alert.alert(
      "Log out?",
      "You'll need to sign in again to access your conversations.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              abortControllerRef.current?.abort();
              await onLogout?.();
            } catch (error: any) {
              console.error("LOGOUT ERROR:", error);
              Alert.alert(
                "Could not log out",
                error?.message || "Something went wrong."
              );
            } finally {
              setIsLoggingOut(false);
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
    updater: (messages: Message[]) => Message[]
  ) => {
    if (!activeSessionId) return;

    setSessions((previous) =>
      previous.map((session) => {
        if (session.id !== activeSessionId) return session;

        const updatedMessages = updater(session.messages || []);
        return {
          ...session,
          messages: updatedMessages,
        };
      })
    );
  };

  // ------------------------------------------------
  // UPDATE SESSION TITLE
  // ------------------------------------------------


const handleUpdateSessionTitle = async (
  sessionId: string,
  newTitle: string
) => {
  try {
    await updateSessionTitleApi(
      sessionId,
      newTitle
    );

    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title: newTitle,
            }
          : session
      )
    );
  } catch (error: any) {
    console.error(
      "UPDATE SESSION TITLE ERROR:",
      error
    );

    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title: newTitle,
            }
          : session
      )
    );
  }
};

  // ------------------------------------------------
  // STREAM CHAT
  // ------------------------------------------------

  const handleSend = async () => {
    const text = input.trim();

    if (
      !text ||
      !activeSessionId ||
      isSending
    ) {
      return;
    }

    const sessionIdAtSend = activeSessionId;

    const userMessage: Message = {
      id: uid(),
      role: "user",
      text,
      time: nowLabel(),
    };

    updateActiveMessages((messages) => [
      ...messages,
      userMessage,
    ]);

    setInput("");
    setIsSending(true);
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let reader:
      | ReadableStreamDefaultReader<Uint8Array>
      | undefined;

    try {
      // --------------------------------------------
      // UPDATE TITLE FOR NEW CHAT
      // --------------------------------------------

      if (
        activeSession?.title === "New Chat"
      ) {
        const newTitle =
          shortenTitle(text);

        await handleUpdateSessionTitle(
          sessionIdAtSend,
          newTitle
        );
      }

      // --------------------------------------------
      // SEND MESSAGE
      // --------------------------------------------

      const response =
        await streamChatMessageApi(
          sessionIdAtSend,
          text,
          { signal: controller.signal }
        );

      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this response."
        );
      }

      reader = response.body.getReader();

      const decoder = new TextDecoder();

      const aiMessageId = uid();

      let aiText = "";
      let buffer = "";

      // Add empty AI message
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

      // --------------------------------------------
      // STREAM RESPONSE
      // --------------------------------------------

      while (true) {
        if (controller.signal.aborted) break;

        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(
          value,
          { stream: true }
        );

        const lines = buffer.split("\n");

        // Keep incomplete line
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();

          if (
            !line ||
            !line.startsWith("data:")
          ) {
            continue;
          }

          const dataContent = line
            .replace(/^data:\s*/, "")
            .trim();

          if (dataContent === "[DONE]") {
            continue;
          }

          let incomingChunk = "";

          try {
            const parsed = JSON.parse(dataContent);
            incomingChunk = parsed.text ?? "";
          } catch {
            incomingChunk = dataContent;
          }

          if (!incomingChunk) continue;

          aiText += incomingChunk;

          updateActiveMessages((messages) =>
            messages.map((message) =>
              message.id === aiMessageId
                ? { ...message, text: aiText }
                : message
            )
          );
        }
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
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
      try {
        reader?.releaseLock();
      } catch {
        // no-op — already released or never acquired
      }

      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

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
    activeMessages.length,
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            toggleDrawer(true)
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="menu-outline"
            size={24}
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
              {isTyping ? "Thinking…" : "AI assistant"}
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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="add"
            size={22}
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
            data={activeMessages}
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
            keyboardShouldPersistTaps="handled"
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
                    size={28}
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
                  Ask me anything and let's figure it out together.
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
                size={28}
                color={NAVY}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              Start a conversation
            </Text>

            <Text style={styles.emptySubtitle}>
              Your chats will show up here once you begin.
            </Text>

            <TouchableOpacity
              style={
                styles.startButton
              }
              onPress={
                handleNewSession
              }
              activeOpacity={0.85}
            >
              <Ionicons
                name="add"
                size={18}
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
              activeOpacity={0.85}
            >
              {isSending ? (
                <ActivityIndicator
                  size="small"
                  color={WHITE}
                />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={19}
                  color={WHITE}
                />
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={styles.inputHint}
          >
            TalkFlow can make mistakes. Check important information.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* OVERLAY + DRAWER (stay mounted through the close animation) */}

      {drawerVisible && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => toggleDrawer(false)}
          >
            <Animated.View
              style={[
                styles.overlay,
                { opacity: overlayOpacity },
              ]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [
                  { translateX: drawerTranslateX },
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
                    {sessions.length === 1
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={NAVY}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.newChatButton}
                onPress={
                  handleNewSession
                }
                activeOpacity={0.85}
              >
                <View
                  style={
                    styles.newChatIcon
                  }
                >
                  <Ionicons
                    name="add"
                    size={19}
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
                  size={17}
                  color={MUTED}
                />
              </TouchableOpacity>

              <Text
                style={styles.sectionLabel}
              >
                RECENT CHATS
              </Text>

              <View style={styles.sessionListWrap}>
                <FlatList
                  data={sessions}
                  keyExtractor={(item) =>
                    item.id
                  }
                  contentContainerStyle={{
                    paddingBottom: 14,
                  }}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View
                      style={
                        styles.drawerEmpty
                      }
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={28}
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
                  renderItem={({ item }) => {
                    const isActive = item.id === activeSessionId;
                    const messageList = item.messages || [];
                    const lastMessage = messageList[messageList.length - 1];

                    const isCurrentlyActiveAndTyping = isActive && isTyping;

                    const preview = isCurrentlyActiveAndTyping
                      ? "Typing..."
                      : lastMessage?.text?.trim() || "No messages yet";

                    return (
                      <TouchableOpacity
                        style={[
                          styles.sessionItem,
                          isActive && styles.sessionItemActive,
                        ]}
                        onPress={() => handleSelectSession(item.id)}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.sessionIcon,
                            isActive && styles.sessionIconActive,
                          ]}
                        >
                          <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={isActive ? NAVY : MUTED}
                          />
                        </View>

                        <View style={styles.sessionContent}>
                          <Text
                            style={[
                              styles.sessionTitle,
                              isActive && styles.sessionTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title || "New Chat"}
                          </Text>

                          <Text
                            style={styles.sessionPreview}
                            numberOfLines={1}
                          >
                            {preview}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteSession(item.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={DANGER}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* FOOTER: profile + logout, pinned to the bottom */}

              <View style={styles.drawerFooter}>
                <View style={styles.drawerDivider} />

                <View style={styles.profileRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>
                      {userName?.trim()?.[0]?.toUpperCase() || "U"}
                    </Text>
                  </View>

                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {userName}
                    </Text>

                    {!!userEmail && (
                      <Text style={styles.profileEmail} numberOfLines={1}>
                        {userEmail}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.75}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color={DANGER} />
                  ) : (
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color={DANGER}
                    />
                  )}

                  <Text style={styles.logoutButtonText}>
                    {isLoggingOut ? "Logging out…" : "Log out"}
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </>
      )}
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
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,

    shadowColor: "#0C0E1E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
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
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    maxWidth: "90%",
    letterSpacing: -0.2,
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
    paddingTop: 18,
    paddingBottom: 18,
    flexGrow: 1,
  },

  // EMPTY STATE

  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingTop: 70,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E9EAF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 260,
  },

  noSession: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  startButton: {
    marginTop: 20,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,

    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
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
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E9EAF1",
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

    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },

  sendButtonDisabled: {
    backgroundColor: "#C8CAD4",
    shadowOpacity: 0,
    elevation: 0,
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
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  drawerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT,
    letterSpacing: -0.3,
  },

  drawerSubtitle: {
    fontSize: 11.5,
    color: MUTED,
    marginTop: 2,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
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
    borderWidth: 1,
    borderColor: "#ECEAF3",
  },

  newChatIcon: {
    width: 38,
    height: 38,
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
    marginTop: 22,
    marginBottom: 6,
  },

  sessionListWrap: {
    flex: 1,
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
    width: 36,
    height: 36,
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
    fontWeight: "800",
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
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  loadingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
    marginTop: 15,
    letterSpacing: -0.4,
  },

  loadingSubtitle: {
    fontSize: 12.5,
    color: MUTED,
    marginTop: 5,
  },
});