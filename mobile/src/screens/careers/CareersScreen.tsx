import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Briefcase, GraduationCap, Building2, MapPin, Send, Plus, CheckCircle2, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { JobCard } from '../../components/careers/JobCard';
import { apiService } from '../../services/api';

export const CareersScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'internships' | 'requirements'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverNote, setCoverNote] = useState('');
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'requirements') {
      const reqs = await apiService.getRequirements();
      setRequirements(reqs);
    } else {
      const jobList = await apiService.getJobs(activeTab === 'internships' ? 'internship' : 'job');
      setJobs(jobList);
    }
  };

  const handleOpenApply = (job: any) => {
    setSelectedJob(job);
    setCoverNote('I am interested in applying for this position with my verified NyayaSetu Legal CV & portfolio.');
    setApplyModalVisible(true);
  };

  const handleConfirmApply = () => {
    setApplyModalVisible(false);
    setAppliedBanner(`Applied successfully to ${selectedJob?.title}! The chamber will review your Legal CV.`);
    setTimeout(() => setAppliedBanner(null), 4000);
  };

  return (
    <View style={styles.container}>
      <Header title="Legal Careers & Marketplace" showSearch={false} />

      {/* Tab Switcher */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'jobs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('jobs')}
        >
          <Briefcase size={14} color={activeTab === 'jobs' ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>Legal Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'internships' && styles.tabBtnActive]}
          onPress={() => setActiveTab('internships')}
        >
          <GraduationCap size={14} color={activeTab === 'internships' ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'internships' && styles.tabTextActive]}>Internships</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'requirements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('requirements')}
        >
          <Building2 size={14} color={activeTab === 'requirements' ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'requirements' && styles.tabTextActive]}>Requirements</Text>
        </TouchableOpacity>
      </View>

      {/* Success Notification */}
      {appliedBanner && (
        <View style={styles.appliedAlert}>
          <CheckCircle2 size={16} color={Colors.success} />
          <Text style={styles.appliedText}>{appliedBanner}</Text>
        </View>
      )}

      {/* Content Feed */}
      {activeTab === 'requirements' ? (
        <FlatList
          data={requirements}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.reqCard}>
              <View style={styles.reqTop}>
                <Text style={styles.reqTypeBadge}>{item.req_type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.reqLocation}>{item.city || 'Delhi'}</Text>
              </View>
              <Text style={styles.reqTitle}>{item.title}</Text>
              <View style={styles.reqBottom}>
                <Text style={styles.reqBudget}>Budget: {item.budget || 'Negotiable'}</Text>
                <TouchableOpacity style={styles.respondBtn} onPress={() => Alert.alert('Requirement Response', 'Connected with requirement creator.')}>
                  <Text style={styles.respondBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <JobCard job={item} onApplyPress={() => handleOpenApply(item)} />
          )}
        />
      )}

      {/* 1-Click Application Modal */}
      <Modal visible={applyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>1-Click Legal Application</Text>
              <TouchableOpacity onPress={() => setApplyModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.jobSummaryBox}>
              <Text style={styles.modalJobTitle}>{selectedJob?.title}</Text>
              <Text style={styles.modalJobOrg}>{selectedJob?.org_name || 'Law Chambers'}</Text>
            </View>

            <View style={styles.cvAttachedCard}>
              <CheckCircle2 size={16} color={Colors.success} />
              <View>
                <Text style={styles.cvTitle}>Verified NyayaSetu Legal CV Attached</Text>
                <Text style={styles.cvSub}>Includes Bar credentials, Moot citations, and publications.</Text>
              </View>
            </View>

            <Text style={styles.noteLabel}>Cover Note to Recruiter / Partner:</Text>
            <TextInput
              style={styles.coverInput}
              multiline
              numberOfLines={3}
              value={coverNote}
              onChangeText={setCoverNote}
            />

            <TouchableOpacity style={styles.submitApplyBtn} onPress={handleConfirmApply}>
              <Send size={16} color={Colors.textInverse} />
              <Text style={styles.submitApplyText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  appliedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  appliedText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: Typography.fontWeights.medium,
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  reqCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqTypeBadge: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accentOrange,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reqLocation: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  reqTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  reqBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reqBudget: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryLight,
  },
  respondBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  respondBtnText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  jobSummaryBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  modalJobTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  modalJobOrg: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cvAttachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  cvTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: '#065F46',
  },
  cvSub: {
    fontSize: 10,
    color: '#047857',
  },
  noteLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  coverInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    height: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  submitApplyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  submitApplyText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.sm,
  },
});
