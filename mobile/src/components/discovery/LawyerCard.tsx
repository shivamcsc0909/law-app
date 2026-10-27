import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Scale, Award, MessageCircle, Calendar } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface LawyerCardProps {
  lawyer: any;
  onConsultPress?: () => void;
  onProfilePress?: () => void;
}

export const LawyerCard: React.FC<LawyerCardProps> = ({
  lawyer,
  onConsultPress,
  onProfilePress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onProfilePress}
      activeOpacity={0.85}
    >
      <View style={styles.topSection}>
        {lawyer.avatar_url ? (
          <Image source={{ uri: lawyer.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{lawyer.full_name?.charAt(0) || 'A'}</Text>
          </View>
        )}

        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{lawyer.full_name}</Text>
            {lawyer.verified_badge === 1 && <VerifiedBadge size={16} />}
          </View>

          <Text style={styles.headline} numberOfLines={2}>
            {lawyer.headline || 'Advocate & Legal Consultant'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Scale size={13} color={Colors.primaryLight} />
              <Text style={styles.metaText}>{lawyer.primary_court || 'High Court'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{lawyer.city || 'Delhi'}, {lawyer.state || 'India'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Practice Area Badges */}
      <View style={styles.tagsContainer}>
        {lawyer.practice_areas?.slice(0, 3).map((pa: any) => (
          <View key={pa.id} style={styles.tag}>
            <Text style={styles.tagText}>{pa.name}</Text>
          </View>
        ))}
        <View style={styles.experienceBadge}>
          <Award size={12} color={Colors.accentOrange} />
          <Text style={styles.expText}>{lawyer.experience_years || 5}+ Yrs Exp</Text>
        </View>
      </View>

      {/* Bar Number & Consultation Fee */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.barLabel}>Bar Council Enrolment</Text>
          <Text style={styles.barNumber}>{lawyer.bar_council_number || 'Enrolled Advocate'}</Text>
        </View>

        <TouchableOpacity style={styles.consultBtn} onPress={onConsultPress}>
          <MessageCircle size={15} color={Colors.textInverse} />
          <Text style={styles.consultBtnText}>Consult</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.lg,
  },
  mainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginVertical: Spacing.md,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: Typography.fontWeights.medium,
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  expText: {
    fontSize: 11,
    color: Colors.accentOrange,
    fontWeight: Typography.fontWeights.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  barNumber: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm,
  },
  consultBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
});
