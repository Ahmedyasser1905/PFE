import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Send, X, Trash2, Zap, Brain, MessageSquare } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { chatApi } from '../../../api/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  { id: '1', text: 'What is cement ratio?', icon: '🏗️' },
  { id: '2', text: 'كم نسبة خلط الاسمنت؟', icon: '👷' },
  { id: '3', text: 'Standard door size', icon: '🚪' },
  { id: '4', text: 'كم تكلفة بناء منزل؟', icon: '💰' },
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحبًا! اسألني عن البناء... 👷'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const clearChat = async () => {
    try {
      if (sessionId) await chatApi.clearHistory(sessionId);
    } catch (e) {
      // Best effort
    }
    setSessionId(null);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'مرحبًا! اسألني عن البناء... 👷'
    }]);
  };

  const handleSuggestion = (text: string) => {
    setInputText(text);
    // Auto-send could also be implemented here
  };

  const sendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    
    setInputText('');
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Route through backend — API key stays on server
      const { data } = await chatApi.sendMessage(textToSend, sessionId || undefined);
      
      // Track session for continuity
      if (data.sessionId) setSessionId(data.sessionId);
      
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message?.content || 'No response',
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Chat API Error:', error?.response?.data || error.message);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isArabic = /[\u0600-\u06FF]/.test(item.content);

    return (
      <View style={[
        styles.messageContainer, 
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.assistantBubble,
          { shadowColor: isUser ? theme.colors.primary : '#000' }
        ]}>
          <Text style={[
            styles.messageText, 
            isUser ? styles.userText : styles.assistantText,
            { textAlign: isArabic ? 'right' : 'left' }
          ]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Curved Blue Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
            <X size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>AI Construction 🏗️</Text>
          
          <TouchableOpacity onPress={clearChat} style={styles.headerIconBtn}>
            <Trash2 size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
             <View style={styles.suggestionsRow}>
                 {SUGGESTIONS.slice(0, 2).map((chip) => (
                     <TouchableOpacity 
                        key={chip.id} 
                        style={styles.suggestionChip}
                        onPress={() => handleSuggestion(chip.text)}
                     >
                        <Text style={styles.suggestionText}>{chip.text}</Text>
                     </TouchableOpacity>
                 ))}
             </View>
             <View style={styles.suggestionsRow}>
                 {SUGGESTIONS.slice(2, 4).map((chip) => (
                     <TouchableOpacity 
                        key={chip.id} 
                        style={styles.suggestionChip}
                        onPress={() => handleSuggestion(chip.text)}
                     >
                        <Text style={styles.suggestionText}>{chip.text}</Text>
                     </TouchableOpacity>
                 ))}
             </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isLoading ? (
            <View style={styles.assistantMessageContainer}>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          ) : null}
        />

        <View style={styles.bottomSection}>
          <View style={styles.inputWrapper}>
             <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && { backgroundColor: '#e2e8f0' }]} 
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
             >
                <Send size={20} color={!inputText.trim() ? '#94a3b8' : "#fff"} />
             </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="اكتب سؤالك..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={1000}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1d4ed8', 
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 16,
    gap: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  suggestionChip: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    width: '100%',
    marginVertical: 6,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#1d4ed8',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#1e293b',
  },
  loadingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  bottomSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});

