import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Scale, Calendar, Clock, FileText, ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface CaseCardProps {
  caseData: any;
  onPress?: () => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.caseBadge}>
          <Scale size={14} color={Colors.accent} />
          <Text style={styles.caseNumber}>{caseData.case_number}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{caseData.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{caseData.title}</Text>

      <View style={styles.courtRow}>
        <Text style={styles.courtText}>{caseData.court_name || 'High Court of Delhi'}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.areaText}>{caseData.practice_area_name || 'Commercial Suit'}</Text>
      </View>

      {/* Next Hearing Alert Box */}
      {caseData.next_hearing && (
        <View style={styles.hearingBox}>
          <View style={styles.hearingHeader}>
            <Calendar size={13} color={Colors.accentOrange} />
            <Text style={styles.hearingDateLabel}>Next Listed Hearing:</Text>
            <Text style={styles.hearingDateText}>
              {caseData.next_hearing.hearing_date?.substring(0, 10)}
            </Text>
          </View>
          <Text style={styles.hearingPurpose} numberOfLines={1}>
            {caseData.next_hearing.purpose}
          </Text>
        </View>
      )}

      {/* Parties Info */}
      <View style={styles.footer}>
        <View style={styles.parties}>
          <Text style={styles.partyLabel}>Lawyer: <Text style={styles.partyVal}>{caseData.lawyer_name}</Text></Text>
          <Text style={styles.partyLabel}>Client: <Text style={styles.partyVal}>{caseData.client_name}</Text></Text>
        </View>
        <View style={styles.openBtn}>
          <Text style={styles.openBtnText}>Open Workspace</Text>
          <ChevronRight size={14} color={Colors.primaryLight} />
        </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  caseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  caseNumber: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accent,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.success,
  },
  title: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  courtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  courtText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  dot: {
    color: Colors.textMuted,
  },
  areaText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primaryLight,
  },
  hearingBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginVertical: Spacing.xs,
  },
  hearingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hearingDateLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  hearingDateText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accentOrange,
  },
  hearingPurpose: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  parties: {
    gap: 1,
  },
  partyLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  partyVal: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semibold,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
});
