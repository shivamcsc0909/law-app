import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Plus,
  Scale,
  Send,
  X,
  Compass,
  UserCheck
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { PostCard } from '../../components/feed/PostCard';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, isGuest, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postContentType, setPostContentType] = useState('text');

  const categories = ['For You', 'Legal News', 'Legal Knowledge', 'Discussions', 'Careers'];

  useEffect(() => {
    loadFeed(selectedCategory);
  }, [selectedCategory]);

  const loadFeed = async (cat: string) => {
    setLoading(true);
    const feed = await apiService.getFeed(cat);
    setPosts(feed);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed(selectedCategory);
    setRefreshing(false);
  };

  const handleOpenCreatePost = () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'You are currently exploring as a Guest. Please sign in with your mobile number or email to publish posts and connect with advocates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In / Register', onPress: () => logout() }
        ]
      );
      return;
    }
    setCreateModalVisible(true);
  };

  const handleCreatePost = async () => {
    if (!postBody.trim() && !postTitle.trim()) return;
    await apiService.createPost({
      title: postTitle,
      body: postBody,
      content_type: postContentType,
      category: selectedCategory === 'For You' ? 'Legal Knowledge' : selectedCategory
    });
    setPostBody('');
    setPostTitle('');
    setCreateModalVisible(false);
    loadFeed(selectedCategory);
  };

  return (
    <View style={styles.container}>
      <Header
        title="NyayaSetu"
        onSearchPress={() => navigation?.navigate('Discover')}
      />

      {/* Guest Mode Banner */}
      {isGuest && (
        <TouchableOpacity style={styles.guestBanner} onPress={logout} activeOpacity={0.8}>
          <Compass size={16} color={Colors.accentOrange} />
          <Text style={styles.guestBannerText}>
            Browsing as Guest (अतिथि) • Tap to Sign In / Verify
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Action Prompt Bar */}
      <View style={styles.promptBar}>
        <TouchableOpacity
          style={styles.promptInput}
          onPress={handleOpenCreatePost}
          activeOpacity={0.8}
        >
          <Text style={styles.promptText}>Share legal insights, case updates, or post a query...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createBtn} onPress={handleOpenCreatePost}>
          <Plus size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Feed List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching legal ecosystem updates...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onVotePoll={(optId) => {
                if (isGuest) {
                  Alert.alert('Sign In Required', 'Sign in to participate in legal community polls.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => logout() }
                  ]);
                  return;
                }
                apiService.votePoll(item.poll?.id || 1, optId);
              }}
            />
          )}
          contentContainerStyle={styles.feedList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Scale size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Posts in this Category</Text>
              <Text style={styles.emptyDesc}>Be the first advocate to share updates on {selectedCategory}.</Text>
            </View>
          }
        />
      )}

      {/* Create Post Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Legal Post</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postTitleInput}
              placeholder="Headline / Title (e.g. Landmark Judgment Analysis)"
              value={postTitle}
              onChangeText={setPostTitle}
              placeholderTextColor={Colors.textMuted}
            />

            <TextInput
              style={styles.postBodyInput}
              placeholder="What would you like to discuss with the Indian legal community?"
              value={postBody}
              onChangeText={setPostBody}
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={6}
            />

            <View style={styles.modalFooter}>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typePill, postContentType === 'text' && styles.typePillActive]}
                  onPress={() => setPostContentType('text')}
                >
                  <Text style={[styles.typePillText, postContentType === 'text' && styles.typePillTextActive]}>Text</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typePill, postContentType === 'article' && styles.typePillActive]}
                  onPress={() => setPostContentType('article')}
                >
                  <Text style={[styles.typePillText, postContentType === 'article' && styles.typePillTextActive]}>Article</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typePill, postContentType === 'poll' && styles.typePillActive]}
                  onPress={() => setPostContentType('poll')}
                >
                  <Text style={[styles.typePillText, postContentType === 'poll' && styles.typePillTextActive]}>Poll</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.publishBtn} onPress={handleCreatePost}>
                <Send size={16} color={Colors.textInverse} />
                <Text style={styles.publishBtnText}>Publish</Text>
              </TouchableOpacity>
            </View>
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
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEDD5',
  },
  guestBannerText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accentOrange,
  },
  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  promptInput: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  promptText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.textInverse,
  },
  feedList: {
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyDesc: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  postTitleInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postBodyInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
  },
  typePillActive: {
    backgroundColor: Colors.primaryLight,
  },
  typePillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  typePillTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  publishBtnText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.sm,
  },
});
