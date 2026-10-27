import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Scale, Phone, ShieldCheck, CheckCircle2, ArrowRight, Compass, Eye, Sparkles } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { useAuth, UserRole } from '../../context/AuthContext';

export const LoginScreen: React.FC<{ navigation?: any }> = () => {
  const { loginWithPhoneOrEmail, loginAsGuest, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('+919810123456');
  const [selectedRole, setSelectedRole] = useState<UserRole>('senior_advocate');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('123456');

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'senior_advocate', title: 'Senior Advocate / Counsel', desc: 'High Court & Supreme Court litigator' },
    { role: 'advocate', title: 'Advocate / Legal Consultant', desc: 'Active bar member & practitioner' },
    { role: 'junior_lawyer', title: 'Junior Lawyer / Associate', desc: 'Chamber associate & researcher' },
    { role: 'student', title: 'Law Student / Aspirant', desc: 'LL.B / LL.M student seeking internships' },
    { role: 'public_user', title: 'Public / Client / Citizen', desc: 'Seeking legal help, lawyers & advice' },
    { role: 'law_firm', title: 'Law Firm / Legal Agency', desc: 'Managing corporate practice & hiring' },
  ];

  const handleSendOTP = () => {
    if (!identifier.trim()) return;
    setOtpSent(true);
  };

  const handleVerify = async () => {
    await loginWithPhoneOrEmail(identifier, selectedRole);
  };

  const handleExploreGuest = () => {
    loginAsGuest();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Branding Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Scale size={32} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>NyayaSetu</Text>
          <Text style={styles.tagline}>India's Legal Professional & Community Network</Text>
          <Text style={styles.subtag}>“Understand. Connect. Resolve.”</Text>
        </View>

        {/* Explore as Guest Top Highlight Card */}
        <TouchableOpacity style={styles.guestHeroCard} onPress={handleExploreGuest} activeOpacity={0.85}>
          <View style={styles.guestIconBadge}>
            <Compass size={22} color={Colors.accentOrange} />
          </View>
          <View style={styles.guestTextGroup}>
            <View style={styles.guestTitleRow}>
              <Text style={styles.guestCardTitle}>Explore as Guest (अतिथि)</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>Instant Access</Text>
              </View>
            </View>
            <Text style={styles.guestCardSub}>
              Browse verified advocates, legal help categories, knowledge hub & career listings without login.
            </Text>
          </View>
          <ArrowRight size={18} color={Colors.accentOrange} />
        </TouchableOpacity>

        {/* Unified Identity Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {otpSent ? 'Enter OTP Verification Code' : 'Sign In / Register'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {otpSent
              ? `Verification code sent to ${identifier}`
              : 'Sign in with your mobile number or email. One unified account for all legal workflows.'}
          </Text>

          {!otpSent ? (
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Phone size={18} color={Colors.primaryLight} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Mobile (+91XXXXXXXXXX) or Email"
                value={identifier}
                onChangeText={setIdentifier}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <ShieldCheck size={18} color={Colors.success} />
              </View>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="6-Digit OTP (Demo: 123456)"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          )}

          {/* Role Picker */}
          {!otpSent && (
            <View style={styles.roleSection}>
              <Text style={styles.sectionLabel}>Select Your Ecosystem Role:</Text>
              {roles.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <TouchableOpacity
                    key={r.role}
                    style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                    onPress={() => setSelectedRole(r.role)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.roleRadio}>
                      {isSelected && <View style={styles.roleRadioInner} />}
                    </View>
                    <View style={styles.roleTextGroup}>
                      <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
                        {r.title}
                      </Text>
                      <Text style={styles.roleDesc}>{r.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Action Button */}
          {!otpSent ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Send Verification OTP</Text>
              <ArrowRight size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} disabled={isLoading} activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Verify & Enter NyayaSetu</Text>
                  <CheckCircle2 size={18} color={Colors.textInverse} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          By continuing, you agree to NyayaSetu's Terms of Service and Advocate Code of Ethics. We do not provide automated judicial representation.
        </Text>
      </ScrollView>
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
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  appName: {
    fontSize: Typography.fontSizes.display,
    fontWeight: Typography.fontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
    marginTop: 2,
    textAlign: 'center',
  },
  subtag: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.accentOrange,
    fontWeight: Typography.fontWeights.semibold,
    marginTop: 2,
  },
  guestHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#EA580C',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  guestIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTextGroup: {
    flex: 1,
  },
  guestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestCardTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: '#9A3412',
  },
  freeBadge: {
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: Typography.fontWeights.bold,
  },
  guestCardSub: {
    fontSize: 11,
    color: '#7C2D12',
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  otpInput: {
    fontFamily: 'monospace',
    letterSpacing: 4,
    fontSize: Typography.fontSizes.lg,
  },
  roleSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  roleCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#FFFDF5',
  },
  roleRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  roleRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentOrange,
  },
  roleTextGroup: {
    flex: 1,
  },
  roleTitle: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  roleTitleSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
  roleDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 15,
  },
});
