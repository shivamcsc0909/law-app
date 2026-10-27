import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import {
  Scale,
  FolderLock,
  FileText,
  Calendar,
  Plus,
  Lock,
  Download,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { CaseCard } from '../../components/workspace/CaseCard';
import { apiService } from '../../services/api';

export const WorkspaceScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'vault'>('cases');
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('All');

  const folders = ['All', 'Property', 'Court', 'Police', 'Employment', 'Family', 'General'];

  useEffect(() => {
    loadData();
  }, [activeTab, selectedFolder]);

  const loadData = async () => {
    if (activeTab === 'cases') {
      const cList = await apiService.getCases();
      setCases(cList);
    } else {
      const docList = await apiService.getDocuments(selectedFolder);
      setDocuments(docList);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Legal Case Workspace" showSearch={false} />

      {/* Sub-navigation Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'cases' && styles.tabBtnActive]}
          onPress={() => setActiveTab('cases')}
        >
          <Scale size={15} color={activeTab === 'cases' ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'cases' && styles.tabTextActive]}>
            Active Cases ({cases.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'vault' && styles.tabBtnActive]}
          onPress={() => setActiveTab('vault')}
        >
          <FolderLock size={15} color={activeTab === 'vault' ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'vault' && styles.tabTextActive]}>
            Secure Doc Vault
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cases View */}
      {activeTab === 'cases' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Client-Lawyer Private Workspaces</Text>
            <Text style={styles.sectionSub}>End-to-end encrypted hearing tracking, briefs & tasks</Text>
          </View>

          {cases.map((c) => (
            <CaseCard
              key={c.id}
              caseData={c}
              onPress={() => Alert.alert('Case Workspace', `Opening hearing ledger and court documents for ${c.case_number}`)}
            />
          ))}
        </ScrollView>
      ) : (
        /* Document Vault View */
        <View style={styles.vaultContainer}>
          {/* Folder Pills */}
          <View style={styles.folderBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderScroll}>
              {folders.map((f) => {
                const isSelected = selectedFolder === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.folderPill, isSelected && styles.folderPillActive]}
                    onPress={() => setSelectedFolder(f)}
                  >
                    <Text style={[styles.folderPillText, isSelected && styles.folderPillTextActive]}>
                      {f} Docs
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={documents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.docList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.docCard}>
                <View style={styles.docIconBox}>
                  <FileText size={22} color={Colors.primaryLight} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.docMeta}>
                    <Text style={styles.docFolder}>{item.folder_name}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Lock size={11} color={Colors.success} />
                    <Text style={styles.docEncrypted}>Encrypted</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => Alert.alert('Download', `Downloading ${item.title} securely...`)}
                >
                  <Download size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabRow: {
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
  scrollContent: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vaultContainer: {
    flex: 1,
  },
  folderBar: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  folderScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  folderPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  folderPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  folderPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  folderPillTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  docList: {
    padding: Spacing.lg,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  docFolder: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: Typography.fontWeights.semibold,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  docEncrypted: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: Typography.fontWeights.medium,
  },
  downloadBtn: {
    padding: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
  },
});
