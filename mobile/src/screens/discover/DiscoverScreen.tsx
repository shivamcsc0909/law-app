import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Search, MapPin, Scale, Filter, SlidersHorizontal } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/common/Header';
import { LawyerCard } from '../../components/discovery/LawyerCard';
import { apiService } from '../../services/api';

export const DiscoverScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState('All');
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cities = ['All', 'New Delhi', 'Mumbai', 'Bengaluru', 'Prayagraj', 'Chandigarh', 'Chennai'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [selectedAreaId, selectedCity, searchQuery]);

  const loadData = async () => {
    const areas = await apiService.getPracticeAreas();
    setPracticeAreas(areas);
    await fetchLawyers();
  };

  const fetchLawyers = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedAreaId) params['practice_area_id'] = selectedAreaId.toString();
    if (selectedCity !== 'All') params['city'] = selectedCity;
    if (searchQuery.trim()) params['q'] = searchQuery.trim();

    const data = await apiService.getLawyers(params);
    setLawyers(data);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Discover Advocates" showSearch={false} />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lawyers, courts, practice areas (e.g. Criminal Delhi)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {/* City Location Filters */}
      <View style={styles.cityBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {cities.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.cityPill, isSelected && styles.cityPillActive]}
                onPress={() => setSelectedCity(city)}
              >
                <MapPin size={11} color={isSelected ? Colors.textInverse : Colors.textSecondary} />
                <Text style={[styles.cityPillText, isSelected && styles.cityPillTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Practice Area Filter Pills */}
      <View style={styles.areasBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areasScroll}>
          <TouchableOpacity
            style={[styles.areaPill, selectedAreaId === null && styles.areaPillActive]}
            onPress={() => setSelectedAreaId(null)}
          >
            <Text style={[styles.areaPillText, selectedAreaId === null && styles.areaPillTextActive]}>
              All Practice Areas
            </Text>
          </TouchableOpacity>
          {practiceAreas.map((pa) => {
            const isSelected = selectedAreaId === pa.id;
            return (
              <TouchableOpacity
                key={pa.id}
                style={[styles.areaPill, isSelected && styles.areaPillActive]}
                onPress={() => setSelectedAreaId(pa.id)}
              >
                <Text style={[styles.areaPillText, isSelected && styles.areaPillTextActive]}>
                  {pa.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Verified Advocates ({lawyers.length})
        </Text>
        <Text style={styles.barComplianceText}>
          Bar Council Verified Credentials
        </Text>
      </View>

      {/* Lawyers List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching legal practitioners...</Text>
        </View>
      ) : (
        <FlatList
          data={lawyers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LawyerCard
              lawyer={item}
              onConsultPress={() => navigation?.navigate('LegalHelp')}
              onProfilePress={() => navigation?.navigate('Profile')}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Scale size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Advocates Found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your city or practice area filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  cityBar: {
    backgroundColor: Colors.surface,
    paddingBottom: Spacing.xs,
  },
  cityScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  cityPillTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  areasBar: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  areasScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  areaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  areaPillActive: {
    backgroundColor: Colors.accentOrange,
  },
  areaPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  areaPillTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeights.bold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  barComplianceText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: Typography.fontWeights.semibold,
  },
  listContent: {
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
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
});
