import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react-native';
import { ClinicalFoodAlert } from '../../types/alerts';
import { useThemeStore } from '../../stores/themeStore';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface AlertCardProps {
  alert: ClinicalFoodAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { theme, language } = useThemeStore();
  const [expanded, setExpanded] = useState(false);

  const isCritical = alert.severity === 'critical';
  const isModerate = alert.severity === 'moderate';

  const getBorderColor = () => {
    if (isCritical) return alert.severity === 'critical' ? theme.criticalAlertBorder : theme.border;
    if (isModerate) return theme.cautionAlertBorder;
    return theme.infoAlertBorder;
  };

  const getBgColor = () => {
    if (isCritical) return theme.criticalAlertBg;
    if (isModerate) return theme.cautionAlertBg;
    return theme.infoAlertBg;
  };

  const getIconColor = () => {
    if (isCritical) return theme.criticalAlert;
    if (isModerate) return theme.cautionAlert;
    return theme.infoAlert;
  };

  const title = language === 'bn' ? alert.title_bn : alert.title_en;
  const conditionName = language === 'bn' ? alert.conditionName_bn : alert.conditionName_en;
  const explanation = language === 'bn' ? alert.explanation_bn : alert.explanation_en;
  const guidance = language === 'bn' ? alert.guidance_bn : alert.guidance_en;
  const portion = language === 'bn' ? alert.portionContext_bn : alert.portionContext_en;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBgColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconAndHeader}>
          {isCritical ? (
            <AlertCircle size={20} color={getIconColor()} />
          ) : isModerate ? (
            <AlertTriangle size={20} color={getIconColor()} />
          ) : (
            <Info size={20} color={getIconColor()} />
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.conditionBadge, { color: getIconColor() }]}>
              {conditionName}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronUp size={18} color={theme.textSecondary} />
          ) : (
            <ChevronDown size={18} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.explanation, { color: theme.textSecondary }]}>
        {explanation}
      </Text>

      {guidance ? (
        <View style={[styles.guidanceBox, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.guidanceLabel, { color: theme.primary }]}>
            {language === 'bn' ? 'ব্যবহারিক পরামর্শ:' : 'Practical Guidance:'}
          </Text>
          <Text style={[styles.guidanceText, { color: theme.text }]}>{guidance}</Text>
        </View>
      ) : null}

      {expanded && (
        <View style={[styles.detailsSection, { borderTopColor: theme.borderSubtle }]}>
          {portion ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                {language === 'bn' ? 'পরিবেশন প্রেক্ষাপট:' : 'Portion Context:'}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{portion}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'প্রমাণ মান:' : 'Evidence Grade:'}
            </Text>
            <View style={styles.badgeRow}>
              <ShieldCheck size={14} color={theme.accent} />
              <Text style={[styles.evidenceBadgeText, { color: theme.accent }]}>
                {alert.evidenceGrade.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'তথ্যসূত্র:' : 'Source Reference:'}
            </Text>
            <Text style={[styles.sourceText, { color: theme.textMuted }]}>
              {alert.sourceReference} ({alert.ruleVersion})
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    marginVertical: spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconAndHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  conditionBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  expandButton: {
    padding: spacing.xs,
  },
  explanation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  guidanceBox: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  guidanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 12,
    lineHeight: 17,
  },
  detailsSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.xs + 2,
  },
  detailRow: {
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  evidenceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sourceText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 1,
  },
});
