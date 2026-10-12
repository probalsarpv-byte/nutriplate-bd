import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Edit3, Flame, Wheat, Fish, Leaf, Coffee, Apple, Egg, Sparkles } from 'lucide-react-native';
import { MealFoodItem } from '../../types/meal';
import { useThemeStore } from '../../stores/themeStore';
import { formatNumber } from '../../localization/formatters';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface MealFoodCardProps {
  item: MealFoodItem;
  onEdit: (item: MealFoodItem) => void;
  onRemove: (itemId: string) => void;
}

export const MealFoodCard: React.FC<MealFoodCardProps> = ({ item, onEdit, onRemove }) => {
  const { theme, language } = useThemeStore();

  const getCategoryIcon = () => {
    const cat = item.category.toLowerCase();
    const name = item.name_en.toLowerCase();

    if (cat.includes('cereal') || name.includes('rice') || name.includes('ruti')) {
      return <Wheat size={18} color={theme.carb} />;
    }
    if (cat.includes('fish') || cat.includes('meat') || cat.includes('poultry')) {
      return <Fish size={18} color={theme.protein} />;
    }
    if (cat.includes('egg')) {
      return <Egg size={18} color={theme.protein} />;
    }
    if (cat.includes('pulse') || cat.includes('legume')) {
      return <Sparkles size={18} color={theme.accent} />;
    }
    if (cat.includes('fruit')) {
      return <Apple size={18} color={theme.accent} />;
    }
    if (cat.includes('beverage') || cat.includes('milk')) {
      return <Coffee size={18} color={theme.fat} />;
    }
    return <Leaf size={18} color={theme.fibre} />;
  };

  const getStateBadge = () => {
    if (item.foodState === 'COOKED') {
      return {
        label_bn: 'রান্না (Cooked)',
        label_en: 'Cooked',
        bg: '#FFEDD5',
        color: '#C2410C',
      };
    }
    if (item.foodState === 'PREPARED') {
      return {
        label_bn: 'প্রস্তুত পদ (Prepared)',
        label_en: 'Prepared',
        bg: '#E0F2FE',
        color: '#0369A1',
      };
    }
    return {
      label_bn: 'কাঁচা (Raw)',
      label_en: 'Raw',
      bg: '#FEF3C7',
      color: '#B45309',
    };
  };

  const stateBadge = getStateBadge();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.surfaceMuted }]}>
            {getCategoryIcon()}
          </View>
          <View style={styles.nameColumn}>
            <View style={styles.nameWithBadge}>
              <Text style={[styles.foodName, { color: theme.text }]} numberOfLines={1}>
                {language === 'bn' ? item.name_bn : item.name_en}
              </Text>
              <View style={[styles.statePill, { backgroundColor: stateBadge.bg }]}>
                <Text style={[styles.stateText, { color: stateBadge.color }]}>
                  {language === 'bn' ? stateBadge.label_bn : stateBadge.label_en}
                </Text>
              </View>
            </View>
            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
              {item.quantity} {item.unit} ({formatNumber(item.gramWeight, language)}g)
              {item.recipeId ? (language === 'bn' ? ' • ঘরোয়া রেসিপি' : ' • Homemade Recipe') : ''}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onEdit(item)}
            style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={15} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={15} color={theme.criticalAlert} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nutrient Contribution Strip */}
      <View style={[styles.nutrientStrip, { borderTopColor: theme.borderSubtle }]}>
        <View style={styles.macroPillRow}>
          <Text style={[styles.energyText, { color: theme.primary }]}>
            {formatNumber(item.energy_kcal, language)} kcal
          </Text>
          <Text style={[styles.macroPill, { color: theme.carb }]}>
            C: {formatNumber(item.carb_g, language)}g
          </Text>
          <Text style={[styles.macroPill, { color: theme.protein }]}>
            P: {formatNumber(item.protein_g, language)}g
          </Text>
          <Text style={[styles.macroPill, { color: theme.fat }]}>
            F: {formatNumber(item.fat_g, language)}g
          </Text>
          <Text style={[styles.macroPill, { color: theme.fibre }]}>
            আঁশ: {formatNumber(item.fibre_g, language)}g
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 1,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  statePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  stateText: {
    fontSize: 9,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: spacing.xs,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrientStrip: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  macroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  energyText: {
    fontSize: 12,
    fontWeight: '800',
  },
  macroPill: {
    fontSize: 11,
    fontWeight: '600',
  },
});
