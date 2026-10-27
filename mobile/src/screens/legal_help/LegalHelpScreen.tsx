import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import {
  Mic,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Home,
  PoliceBadge,
  HeartCrack,
  FileEdit,
  Send,
  Scale,
  CheckCircle2
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { VoiceIntakeModal } from '../../components/legal_help/VoiceIntakeModal';
import { apiService } from '../../services/api';

export const LegalHelpScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [textProblemTitle, setTextProblemTitle] = useState('');
  const [textProblemDesc, setTextProblemDesc] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const defaultCategories = [
    { id: 1, name: 'Property & Rent', hindi_name: 'संपत्ति एवं किराया', icon: 'home' },
    { id: 2, name: 'Police & Criminal', hindi_name: 'पुलिस एवं आपराधिक', icon: 'police' },
    { id: 3, name: 'Family & Divorce', hindi_name: 'विवाह एवं तलाक', icon: 'family' },
    { id: 4, name: 'Cheque Bounce / 138', hindi_name: 'चेक बाउंस विवाद', icon: 'cheque' },
    { id: 5, name: 'Employment & Labor', hindi_name: 'नौकरी एवं वेतन', icon: 'work' },
    { id: 6, name: 'Cyber Crime / Fraud', hindi_name: 'साइबर अपराध', icon: 'cyber' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const qList = await apiService.getLegalQuestions();
    setQuestions(qList);
    setCategories(defaultCategories);
  };

  const handlePostProblem = async (problemData: any) => {
    const res = await apiService.postLegalProblem(problemData);
    setSuccessBanner('Your legal inquiry has been posted to matched advocates in your jurisdiction.');
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleManualSubmit = () => {
    if (!textProblemDesc.trim()) return;
    handlePostProblem({
      title: textProblemTitle || 'Legal Problem',
      description: textProblemDesc,
      category_id: 1,
      urgency: 'normal'
    });
    setTextProblemTitle('');
    setTextProblemDesc('');
  };

  return (
    <View style={styles.container}>
      <Header title="Legal Help & Intake" showSearch={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        {successBanner && (
          <View style={styles.successAlert}>
            <CheckCircle2 size={18} color={Colors.success} />
            <Text style={styles.successText}>{successBanner}</Text>
          </View>
        )}

        {/* Hero Intake CTA */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBadge}>
              <Scale size={24} color={Colors.accent} />
            </View>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroTitle}>Facing a Legal Problem?</Text>
              <Text style={styles.heroSubtitle}>अपनी कानूनी समस्या बताएं (Voice or Text)</Text>
            </View>
          </View>

          {/* Voice Input Large Button */}
          <TouchableOpacity
            style={styles.voiceHeroBtn}
            onPress={() => setVoiceModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.micCircle}>
              <Mic size={24} color={Colors.textInverse} />
            </View>
            <View style={styles.voiceTextGroup}>
              <Text style={styles.voiceBtnTitle}>Describe in Voice (Hindi / English)</Text>
              <Text style={styles.voiceBtnSub}>Tap here to speak. Our intake assistant will transcribe & structure it.</Text>
            </View>
          </TouchableOpacity>

          {/* Quick Text Intake */}
          <View style={styles.textIntakeContainer}>
            <TextInput
              style={styles.intakeInput}
              placeholder="Or type your problem briefly (e.g. Landlord withheld deposit)..."
              value={textProblemDesc}
              onChangeText={setTextProblemDesc}
              placeholderTextColor={Colors.textMuted}
            />
            {textProblemDesc.trim().length > 0 && (
              <TouchableOpacity style={styles.sendBtn} onPress={handleManualSubmit}>
                <Send size={16} color={Colors.textInverse} />
              </TouchableOpacity>
            )}
          </View>

          {/* Mandatory Privacy Disclaimer */}
          <View style={styles.privacyNote}>
            <ShieldAlert size={14} color={Colors.accentOrange} />
            <Text style={styles.privacyNoteText}>
              Do NOT enter Aadhaar, PAN, Bank account or passwords. All posts are moderated.
            </Text>
          </View>
        </View>

        {/* Legal Knowledge & Problem Categories */}
        <Text style={styles.sectionHeading}>Browse by Legal Category</Text>
        <Text style={styles.sectionSub}>Select an area to explore common remedies and verified advocates</Text>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => navigation?.navigate('Discover')}
              activeOpacity={0.7}
            >
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catHindi}>{cat.hindi_name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Community Q&A Section */}
        <View style={styles.qaHeaderRow}>
          <Text style={styles.sectionHeading}>Ask the Legal Community</Text>
          <TouchableOpacity onPress={() => setVoiceModalOpen(true)}>
            <Text style={styles.askBtnText}>+ Ask Question</Text>
          </TouchableOpacity>
        </View>

        {questions.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.qTop}>
              <View style={styles.qCatBadge}>
                <Text style={styles.qCatText}>{q.category_name || 'Legal Q&A'}</Text>
              </View>
              <Text style={styles.qAsker}>{q.asker_name}</Text>
            </View>
            <Text style={styles.qTitle}>{q.title}</Text>
            <Text style={styles.qDetails}>{q.details}</Text>

            <View style={styles.qFooter}>
              <View style={styles.answerCountBadge}>
                <MessageSquare size={13} color={Colors.primaryLight} />
                <Text style={styles.answerCountText}>{q.answers_count} Advocate Answers</Text>
              </View>
              <Text style={styles.viewAnswerBtn}>View Answers →</Text>
            </View>
          </View>
        ))}

        {/* Bottom Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ⚖️ Legal Disclaimer: Community answers provide general legal information and do not constitute formal attorney-client representation. For court litigation, engage a verified advocate.
          </Text>
        </View>
      </ScrollView>

      {/* Voice Intake Modal */}
      <VoiceIntakeModal
        visible={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSubmitProblem={handlePostProblem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: Typography.fontSizes.xs,
    color: '#065F46',
    fontWeight: Typography.fontWeights.medium,
    flex: 1,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitleGroup: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textInverse,
  },
  heroSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.accent,
    fontWeight: Typography.fontWeights.medium,
  },
  voiceHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    marginBottom: Spacing.md,
  },
  micCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceTextGroup: {
    flex: 1,
  },
  voiceBtnTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textInverse,
  },
  voiceBtnSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  textIntakeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  intakeInput: {
    flex: 1,
    height: 44,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: BorderRadius.sm,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  privacyNoteText: {
    fontSize: 10,
    color: '#CBD5E1',
    flex: 1,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  catHindi: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.accentOrange,
    fontWeight: Typography.fontWeights.medium,
    marginTop: 2,
  },
  qaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  askBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  qCatBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  qCatText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryLight,
  },
  qAsker: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  qTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  qDetails: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  qFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  answerCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerCountText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryLight,
  },
  viewAnswerBtn: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accentOrange,
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 15,
  },
});
