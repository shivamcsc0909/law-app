import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  ShieldCheck,
  MapPin,
  Scale,
  Award,
  BookOpen,
  Briefcase,
  FileDown,
  Share2,
  Edit3,
  LogOut,
  ChevronRight,
  UserCheck,
  Compass,
  LogIn
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { useAuth, UserRole } from '../../context/AuthContext';

export const ProfileScreen: React.FC<{ navigation?: any }> = () => {
  const { user, isGuest, logout, updateUserRole } = useAuth();

  const handleExportCV = () => {
    if (isGuest) {
      Alert.alert('Sign In Required', 'Sign in or register to create and export your official Legal CV / Biodata.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => logout() }
      ]);
      return;
    }
    Alert.alert(
      'Export Legal CV & Biodata',
      'Generating verified legal biodata with Bar Council enrollment details, publications, and moot citations...'
    );
  };

  const handleSwitchRole = (role: UserRole) => {
    updateUserRole(role);
    Alert.alert('Ecosystem Role Updated', `Active role switched to ${role.replace('_', ' ').toUpperCase()}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Legal Profile & CV" showSearch={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guest Conversion Card */}
        {isGuest && (
          <View style={styles.guestCard}>
            <View style={styles.guestHeader}>
              <Compass size={24} color={Colors.accentOrange} />
              <View style={styles.guestTextCol}>
                <Text style={styles.guestTitle}>Guest Explorer Account</Text>
                <Text style={styles.guestDesc}>
                  Sign in with your mobile number or email to create your verified Advocate CV, track cases & connect with clients.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.signInNowBtn} onPress={logout} activeOpacity={0.85}>
              <LogIn size={16} color={Colors.textInverse} />
              <Text style={styles.signInNowText}>Sign In / Register Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cover & Profile Header */}
        <View style={styles.profileHeaderCard}>
          <Image
            source={{ uri: user?.cover_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&q=80' }}
            style={styles.coverImage}
          />
          <View style={styles.avatarWrapper}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'G'}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.full_name || 'Guest Explorer'}</Text>
              {user?.verified_badge === 1 && <VerifiedBadge size={18} />}
            </View>

            <Text style={styles.headline}>
              {user?.headline || 'Exploring Indian Legal Ecosystem'}
            </Text>

            <View style={styles.locationRow}>
              <MapPin size={13} color={Colors.textMuted} />
              <Text style={styles.locationText}>{user?.city || 'India'}, {user?.state || 'National'}</Text>
              <Text style={styles.dot}>•</Text>
              <Scale size={13} color={Colors.primaryLight} />
              <Text style={styles.courtText}>{user?.primary_court || 'High Courts of India'}</Text>
            </View>

            {/* Role & Verification Badge */}
            <View style={styles.badgeRow}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>
                  {(user?.role || 'guest').replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              {user?.verified_badge === 1 ? (
                <View style={styles.verifiedPill}>
                  <ShieldCheck size={12} color={Colors.success} />
                  <Text style={styles.verifiedPillText}>Bar Council Verified</Text>
                </View>
              ) : (
                <View style={styles.unverifiedPill}>
                  <Text style={styles.unverifiedPillText}>{isGuest ? 'Guest Mode' : 'Verification Pending'}</Text>
                </View>
              )}
            </View>

            {/* Quick Profile Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.exportCvBtn} onPress={handleExportCV}>
                <FileDown size={15} color={Colors.textInverse} />
                <Text style={styles.exportCvText}>Export Legal CV (PDF)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Share Profile', 'Public Profile URL copied: nyayasetu.in/profile/advocate')}>
                <Share2 size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bar Council Credentials Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Award size={18} color={Colors.accentOrange} />
            <Text style={styles.sectionTitle}>Bar Council & Practice Credentials</Text>
          </View>
          <View style={styles.credentialGrid}>
            <View style={styles.credentialItem}>
              <Text style={styles.credLabel}>Bar Enrolment No.</Text>
              <Text style={styles.credValue}>{user?.bar_council_number || 'D/1248/2006'}</Text>
            </View>
            <View style={styles.credentialItem}>
              <Text style={styles.credLabel}>Jurisdiction State</Text>
              <Text style={styles.credValue}>Bar Council of Delhi</Text>
            </View>
            <View style={styles.credentialItem}>
              <Text style={styles.credLabel}>Standing / Experience</Text>
              <Text style={styles.credValue}>{user?.experience_years || 18} Years Practice</Text>
            </View>
            <View style={styles.credentialItem}>
              <Text style={styles.credLabel}>Enrolment Year</Text>
              <Text style={styles.credValue}>2006</Text>
            </View>
          </View>
        </View>

        {/* Practice Areas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Scale size={18} color={Colors.primaryLight} />
            <Text style={styles.sectionTitle}>Practice Areas & Specializations</Text>
          </View>
          <View style={styles.tagWrap}>
            {['Criminal Defense', 'Constitutional Litigation', 'Civil & Commercial', 'Arbitration', 'White Collar Crime'].map((area, idx) => (
              <View key={idx} style={styles.areaTag}>
                <Text style={styles.areaTagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Role Demo Switcher */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Switch Ecosystem Role (Demo Testing)</Text>
          <Text style={styles.roleSub}>Test the app from different legal stakeholder perspectives:</Text>
          <View style={styles.roleSwitchWrap}>
            {[
              { id: 'senior_advocate', label: 'Senior Advocate' },
              { id: 'advocate', label: 'Junior / Advocate' },
              { id: 'student', label: 'Law Student' },
              { id: 'public_user', label: 'Client / Public' },
              { id: 'law_firm', label: 'Law Firm' },
              { id: 'guest', label: 'Guest Explorer' }
            ].map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleSwitchBtn, user?.role === r.id && styles.roleSwitchBtnActive]}
                onPress={() => handleSwitchRole(r.id as UserRole)}
              >
                <Text style={[styles.roleSwitchText, user?.role === r.id && styles.roleSwitchTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={16} color={Colors.danger} />
          <Text style={styles.logoutText}>{isGuest ? 'Exit Guest Mode' : 'Sign Out of NyayaSetu'}</Text>
        </TouchableOpacity>
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
  },
  guestCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    marginBottom: Spacing.md,
  },
  guestHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  guestTextCol: {
    flex: 1,
  },
  guestTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: '#9A3412',
  },
  guestDesc: {
    fontSize: 11,
    color: '#7C2D12',
    marginTop: 2,
    lineHeight: 16,
  },
  signInNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm,
  },
  signInNowText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.xs,
  },
  profileHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  coverImage: {
    width: '100%',
    height: 110,
  },
  avatarWrapper: {
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: 28,
    fontWeight: Typography.fontWeights.bold,
  },
  headerInfo: {
    padding: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  dot: {
    color: Colors.textMuted,
  },
  courtText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primaryLight,
    fontWeight: Typography.fontWeights.medium,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  rolePill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.success,
  },
  unverifiedPill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  unverifiedPillText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: Typography.fontWeights.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  exportCvBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  exportCvText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.xs,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  credentialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  credentialItem: {
    width: '48%',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  credLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  credValue: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  areaTag: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  areaTagText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: Typography.fontWeights.medium,
  },
  roleSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  roleSwitchWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  roleSwitchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleSwitchBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleSwitchText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  roleSwitchTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEF2F2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  logoutText: {
    color: Colors.danger,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.sm,
  },
});
