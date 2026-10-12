import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { ClinicalFoodAlert } from '../../types/alerts';
import { AlertCard } from '../alerts/AlertCard';
import { BentoCard } from '../ui/BentoCard';
import { useThemeStore } from '../../stores/themeStore';
import { spacing } from '../../design-system/tokens/spacing';

interface MealAlertsSectionProps {
  alerts: ClinicalFoodAlert[];
}

export const MealAlertsSection: React.FC<MealAlertsSectionProps> = ({ alerts }) => {
  const { theme, language } = useThemeStore();

  if (alerts.length === 0) {
    return (
      <BentoCard style={styles.card}>
        <View style={styles.safeRow}>
          <CheckCircle2 size={20} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.safeTitle, { color: theme.text }]}>
              {language === 'bn' ? 'কার্যকরী পুষ্টি সমন্বয় সন্তোষজনক' : 'Functional Nutrition Balanced'}
            </Text>
            <Text style={[styles.safeSubtitle, { color: theme.textSecondary }]}>
              {language === 'bn'
                ? 'আপনার স্বাস্থ্য প্রোফাইলের সাথে এই মিলের কোনো সরাসরি অ্যালার্জেন বা রোগভিত্তিক সাংঘর্ষিকতা নেই।'
                : 'No acute pathological alerts or allergen conflicts detected for your active health profile.'}
            </Text>
          </View>
        </View>
      </BentoCard>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.titleRow}>
          <ShieldAlert size={18} color={criticalCount > 0 ? theme.criticalAlert : theme.accent} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {language === 'bn' ? 'কার্যকরী পুষ্টি ও রোগভিত্তিক অন্তর্দৃষ্টি' : 'Functional Insights & Pathology Alerts'}
          </Text>
        </View>
        <Text
          style={[
            styles.badgeCount,
            { color: criticalCount > 0 ? theme.criticalAlert : theme.accent },
          ]}
        >
          {alerts.length}
        </Text>
      </View>

      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  safeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  safeSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeCount: {
    fontSize: 13,
    fontWeight: '800',
  },
});
