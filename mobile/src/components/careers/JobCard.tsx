import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building2, MapPin, Briefcase, IndianRupee, Send } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface JobCardProps {
  job: any;
  onApplyPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApplyPress }) => {
  const isInternship = job.job_type === 'internship';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>{job.title}</Text>
          <View style={styles.orgRow}>
            <Building2 size={13} color={Colors.primaryLight} />
            <Text style={styles.orgName}>{job.org_name || 'Litigation Chambers'}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, isInternship && styles.internBadge]}>
          <Text style={[styles.typeText, isInternship && styles.internText]}>
            {job.job_type.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MapPin size={12} color={Colors.textMuted} />
          <Text style={styles.detailText}>{job.city || 'New Delhi'}, {job.state || 'Delhi'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Briefcase size={12} color={Colors.textMuted} />
          <Text style={styles.detailText}>{job.experience_level || '0-2 Yrs'}</Text>
        </View>
      </View>

      <View style={styles.salaryContainer}>
        <Text style={styles.salaryText}>
          {job.stipend_salary || 'Competitive / As per Bar Standards'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.practiceText}>
          {job.practice_area_name || 'Dispute Resolution'}
        </Text>
        <TouchableOpacity style={styles.applyBtn} onPress={onApplyPress}>
          <Send size={13} color={Colors.textInverse} />
          <Text style={styles.applyBtnText}>1-Click Apply with CV</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  orgName: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '15',
  },
  typeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
  internBadge: {
    backgroundColor: Colors.accentOrange + '15',
  },
  internText: {
    color: Colors.accentOrange,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  salaryContainer: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  salaryText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  practiceText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeights.medium,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  applyBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
});
