import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThumbsUp, MessageSquare, Share2, Bookmark, BarChart3, Clock, Scale } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface PostCardProps {
  post: any;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onVotePoll?: (optionId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikePress,
  onCommentPress,
  onSharePress,
  onVotePoll,
}) => {
  const [liked, setLiked] = useState(post.user_reacted || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(
    post.poll?.user_voted_option_id || null
  );

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLikePress?.();
  };

  const handleVote = (optId: number) => {
    if (selectedPollOption) return;
    setSelectedPollOption(optId);
    onVotePoll?.(optId);
  };

  return (
    <View style={styles.card}>
      {/* Author Header */}
      <View style={styles.header}>
        {post.author_avatar ? (
          <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{post.author_name?.charAt(0) || 'L'}</Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{post.author_name}</Text>
            {post.is_author_verified === 1 && <VerifiedBadge size={15} />}
          </View>
          <Text style={styles.headline} numberOfLines={1}>
            {post.author_headline || 'Legal Professional'}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={11} color={Colors.textMuted} />
            <Text style={styles.timestamp}>{post.created_at || 'Just now'}</Text>
            <Text style={styles.dot}>•</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{post.category || 'Legal'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Title (if article or news) */}
      {post.title ? (
        <Text style={styles.postTitle}>{post.title}</Text>
      ) : null}

      {/* Body */}
      <Text style={styles.bodyText}>{post.body}</Text>

      {/* Poll Section */}
      {post.content_type === 'poll' && post.poll && (
        <View style={styles.pollContainer}>
          <View style={styles.pollHeader}>
            <BarChart3 size={16} color={Colors.accent} />
            <Text style={styles.pollTitle}>{post.poll.question}</Text>
          </View>
          {post.poll.options?.map((opt: any) => {
            const isSelected = selectedPollOption === opt.id;
            const total = post.poll.total_votes || 1;
            const percentage = Math.round(((opt.votes_count || 0) / total) * 100);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.pollOption,
                  isSelected && styles.pollOptionSelected,
                ]}
                onPress={() => handleVote(opt.id)}
                activeOpacity={0.7}
              >
                <View style={styles.pollOptionContent}>
                  <Text
                    style={[
                      styles.pollOptionText,
                      isSelected && styles.pollOptionTextSelected,
                    ]}
                  >
                    {opt.option_text}
                  </Text>
                  {selectedPollOption !== null && (
                    <Text style={styles.pollPercentage}>{percentage}%</Text>
                  )}
                </View>
                {selectedPollOption !== null && (
                  <View
                    style={[
                      styles.pollProgress,
                      { width: `${Math.max(5, percentage)}%` },
                      isSelected && { backgroundColor: Colors.accent + '44' },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
          <Text style={styles.pollVotesInfo}>{post.poll.total_votes || 0} votes • Legal Community Poll</Text>
        </View>
      )}

      {/* Interaction Bar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <ThumbsUp
            size={18}
            color={liked ? Colors.primaryLight : Colors.textSecondary}
            fill={liked ? Colors.primaryLight : 'none'}
          />
          <Text style={[styles.actionText, liked && styles.actionTextActive]}>
            {likesCount > 0 ? `${likesCount} Likes` : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onCommentPress}>
          <MessageSquare size={18} color={Colors.textSecondary} />
          <Text style={styles.actionText}>
            {post.comments_count > 0 ? `${post.comments_count} Comments` : 'Comment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onSharePress}>
          <Share2 size={18} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
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
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.md,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  timestamp: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryLight,
  },
  postTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  pollContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pollTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  pollOption: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pollOptionSelected: {
    borderColor: Colors.accent,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  pollOptionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  pollOptionTextSelected: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  pollPercentage: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  pollProgress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.primaryLight + '22',
    zIndex: 1,
  },
  pollVotesInfo: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  actionTextActive: {
    color: Colors.primaryLight,
    fontWeight: Typography.fontWeights.bold,
  },
});
