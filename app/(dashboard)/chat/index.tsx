import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Send, X, Trash2 } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { chatApi } from '~/api/api';
import { AIQuestion } from '~/api/types';
import { useLanguage } from '~/context/LanguageContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your BuildEst AI assistant. How can I help you with your construction project today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIQuestion[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    chatApi.getRecommendedQuestions('assistant')
      .then((r) => { if (r.questions) setSuggestions(r.questions); })
      .catch(() => {});
  }, []);

  const clearChat = useCallback(() => {
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Chat history cleared. How can I help you now?' }]);
  }, []);

  const handleSuggestion = useCallback(async (question: AIQuestion) => {
    const displayText = question.language.en || question.language.ar;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: displayText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const faqResult = await chatApi.getFAQAnswer(question.id, language);
      const answerText = (language === 'ar' ? faqResult.answer?.ar : faqResult.answer?.en) || faqResult.answer?.en || "I couldn't find an answer for that question.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answerText,
      }]);
    } catch {
      // Fallback: fill input so user can send manually
      setInputText(displayText);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const sendMessage = useCallback(async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setInputText('');
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    try {
      const response = await chatApi.sendMessage(textToSend);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || "I'm sorry, I couldn't process that request.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to the expert brain right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

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
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          
          
          <Text style={styles.headerTitle}>AI Construction Expert</Text>
          
          <TouchableOpacity onPress={clearChat} style={styles.headerIconBtn}>
            <Trash2 size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {suggestions.map((q) => (
                <TouchableOpacity 
                  key={q.id} 
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestion(q)}
                >
                  <Text style={styles.suggestionText}>{q.language.en || q.language.ar}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
              placeholder="Ask anything about construction..."
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: theme.colors.primary, 
    paddingTop: 10, 
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  keyboardView: { flex: 1 },
  suggestionsContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  suggestionChip: { 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  chatContent: { paddingHorizontal: 16, paddingVertical: 20 },
  messageContainer: { width: '100%', marginVertical: 6 },
  userMessageContainer: { alignItems: 'flex-end' },
  assistantMessageContainer: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '85%', 
    padding: 14, 
    borderRadius: 18, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 2 },
  assistantBubble: { backgroundColor: 'white', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  userText: { color: 'white' },
  assistantText: { color: '#1e293b' },
  loadingBubble: { paddingVertical: 10, paddingHorizontal: 16 },
  bottomSection: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, fontSize: 15, color: '#0f172a', maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 2 }
});

