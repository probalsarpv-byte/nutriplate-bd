import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Leaf } from 'lucide-react-native';
import { FoodItem } from '../../types/food';
import { useThemeStore } from '../../stores/themeStore';
import { formatNumber } from '../../localization/formatters';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface FoodCardProps {
  food: FoodItem;
  onPress: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onPress }) => {
  const { theme, language } = useThemeStore();

  const displayName = language === 'bn' ? food.bengali || food.name_bn || food.english : food.english || food.name_en || food.bengali;
  const secondaryName = language === 'bn' ? food.english : food.bengali;

  const stateBadgeInfo = React.useMemo(() => {
    const state = food.foodState || 'RAW';
    if (state === 'COOKED') {
      return {
        label: language === 'bn' ? 'রান্না করা' : 'Cooked',
        bg: '#FFEDD5',
        color: '#C2410C',
      };
    }
    if (state === 'PREPARED') {
      return {
        label: language === 'bn' ? 'প্রস্তুত পদ' : 'Prepared Dish',
        bg: '#E0F2FE',
        color: '#0369A1',
      };
    }
    return {
      label: language === 'bn' ? 'কাঁচা' : 'Raw',
      bg: '#FEF3C7',
      color: '#B45309',
    };
  }, [food.foodState, language]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        <View style={styles.nameColumn}>
          <View style={styles.titleRow}>
            <Text style={[styles.mainName, { color: theme.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            {/* Food State Badge */}
            <View style={[styles.statePill, { backgroundColor: stateBadgeInfo.bg }]}>
              <Text style={[styles.statePillText, { color: stateBadgeInfo.color }]}>
                {stateBadgeInfo.label}
              </Text>
            </View>
            {food.is_plant ? (
              <View style={[styles.plantPill, { backgroundColor: theme.fibreLight }]}>
                <Leaf size={10} color={theme.fibre} />
              </View>
            ) : null}
          </View>

          {secondaryName ? (
            <Text style={[styles.secondaryName, { color: theme.textSecondary }]} numberOfLines={1}>
              {secondaryName}
            </Text>
          ) : null}

          <View style={styles.macroPillRow}>
            <View style={[styles.macroPill, { backgroundColor: theme.carbLight }]}>
              <Text style={[styles.macroPillText, { color: theme.carb }]}>
                C: {formatNumber(food.carb_g, language, { maximumFractionDigits: 1 })}g
              </Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: theme.proteinLight }]}>
              <Text style={[styles.macroPillText, { color: theme.protein }]}>
                P: {formatNumber(food.protein_g, language, { maximumFractionDigits: 1 })}g
              </Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: theme.fatLight }]}>
              <Text style={[styles.macroPillText, { color: theme.fat }]}>
                F: {formatNumber(food.fat_g, language, { maximumFractionDigits: 1 })}g
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionColumn}>
          <Text style={[styles.caloriesText, { color: theme.text }]}>
            {formatNumber(food.energy_kcal, language, { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.per100g, { color: theme.textMuted }]}>
            {food.foodState === 'RAW' ? 'kcal/100g কাঁচা' : 'kcal/100g রান্না'}
          </Text>
          <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Plus size={16} color={theme.textInverse} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mainName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  statePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  statePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  plantPill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryName: {
    fontSize: 12,
    marginTop: 2,
  },
  macroPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  macroPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '800',
  },
  per100g: {
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
