import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Mic, MicOff, AlertCircle, ShieldAlert, Check, X, Sparkles } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface VoiceIntakeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitProblem: (data: { title: string; description: string; category_id: number; urgency: string }) => void;
}

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  visible,
  onClose,
  onSubmitProblem,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState('normal');

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time Hindi / English voice transcription
      setTimeout(() => {
        setTranscription(
          'Mera landlord security deposit refund nahi kar raha hai flat vacate karne ke baad bhi. Agreement 11 months ka tha aur peaceful handover ho chuka hai bina kisi damage ke.'
        );
        setTitle('Landlord withholding security deposit after peaceful flat handover');
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleDone = () => {
    if (!transcription.trim()) return;
    onSubmitProblem({
      title: title || 'Legal Problem Intake',
      description: transcription,
      category_id: 1, // Property & Rent
      urgency
    });
    setTranscription('');
    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <Sparkles size={20} color={Colors.accent} />
              <Text style={styles.modalTitle}>Voice Legal Problem Intake</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Privacy Warning */}
          <View style={styles.privacyBanner}>
            <ShieldAlert size={18} color={Colors.danger} />
            <Text style={styles.privacyText}>
              Privacy Notice: Do NOT speak or enter sensitive details like Aadhaar, PAN, OTP, Bank Passwords or Account numbers.
            </Text>
          </View>

          {/* Mic Action Section */}
          <View style={styles.micSection}>
            <TouchableOpacity
              style={[styles.micButton, isRecording && styles.micButtonActive]}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <ActivityIndicator color={Colors.textInverse} size="large" />
              ) : (
                <Mic size={36} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
            <Text style={styles.micStatus}>
              {isRecording ? 'Listening in Hindi / English... (बोलो)' : 'Tap Mic to describe your legal problem by voice'}
            </Text>
          </View>

          {/* Title & Transcription Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Problem Summary / Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Landlord refusing security deposit refund"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={[styles.inputLabel, { marginTop: Spacing.sm }]}>Transcribed Details</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Your spoken or typed legal query will appear here..."
              value={transcription}
              onChangeText={setTranscription}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Urgency Selector */}
          <View style={styles.urgencyRow}>
            <Text style={styles.urgencyLabel}>Urgency:</Text>
            {['normal', 'urgent', 'immediate'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.urgencyPill, urgency === u && styles.urgencyPillActive]}
                onPress={() => setUrgency(u)}
              >
                <Text style={[styles.urgencyText, urgency === u && styles.urgencyTextActive]}>
                  {u.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, !transcription.trim() && styles.submitBtnDisabled]}
            disabled={!transcription.trim()}
            onPress={handleDone}
          >
            <Check size={18} color={Colors.textInverse} />
            <Text style={styles.submitBtnText}>Post to Verified Advocates</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '90%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  privacyText: {
    fontSize: 11,
    color: Colors.danger,
    flex: 1,
    fontWeight: Typography.fontWeights.medium,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: Colors.danger,
  },
  micStatus: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  inputSection: {
    marginTop: Spacing.xs,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  urgencyLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  urgencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  urgencyPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  urgencyTextActive: {
    color: Colors.textInverse,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitBtnText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.md,
  },
});
