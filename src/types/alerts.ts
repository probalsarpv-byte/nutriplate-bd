import { HealthConditionId } from './user';

export type AlertSeverity = 'critical' | 'moderate' | 'informational';

export type EvidenceGrade = 
  | 'A_Grade_Clinical_Trial' 
  | 'B_Grade_Cohort_Study' 
  | 'C_Grade_Consensus_Guidelines' 
  | 'Expert_Consensus_Emerging';

export interface ClinicalFoodAlert {
  id: string;
  conditionId: HealthConditionId;
  conditionName_bn: string;
  conditionName_en: string;
  severity: AlertSeverity;
  title_bn: string;
  title_en: string;
  triggeringNutrientOrFood: string;
  explanation_bn: string;
  explanation_en: string;
  portionContext_bn?: string;
  portionContext_en?: string;
  guidance_bn?: string;
  guidance_en?: string;
  evidenceGrade: EvidenceGrade;
  sourceReference: string;
  ruleVersion: string;
  missingDataDisclosure?: string;
}
