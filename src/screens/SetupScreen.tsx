import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../components/Chip';
import { FieldInput } from '../components/FieldInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuditStore } from '../state/auditStore';
import type { ResearchTier } from '../state/types';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'setup'>;

const TIERS: Array<{ key: ResearchTier; label: string; body: string }> = [
  { key: 'quick', label: 'Quick', body: '18 questions, self-reported only. ~12 min, no network needed.' },
  {
    key: 'standard',
    label: 'Standard',
    body: 'Quick, plus real web & news presence for you and each competitor.',
  },
  {
    key: 'deep',
    label: 'Deep',
    body: 'Standard, plus a live scan of what’s being said about you on LinkedIn, Instagram and X.',
  },
];

export function SetupScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const updateAuditFields = useAuditStore((s) => s.updateAuditFields);
  const setResearchTier = useAuditStore((s) => s.setResearchTier);
  const addCompetitor = useAuditStore((s) => s.addCompetitor);
  const removeCompetitor = useAuditStore((s) => s.removeCompetitor);

  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [competitorDraft, setCompetitorDraft] = useState('');

  const brandValid = audit.brand.trim().length >= 2 && audit.brand.trim().length <= 80;
  const canBegin =
    brandValid && audit.category.trim().length > 0 && audit.market.trim().length > 0 && audit.competitors.length >= 1;

  const commitCompetitor = () => {
    if (competitorDraft.trim()) addCompetitor(competitorDraft);
    setCompetitorDraft('');
    setAddingCompetitor(false);
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Set up the audit" onBack={() => navigation.navigate('home')} />
      <View style={styles.body}>
        <Text style={styles.note}>
          Four inputs. The competitor set decides what your score is measured against, so name
          the three you actually lose deals to.
        </Text>

        <FieldInput
          label="Brand"
          value={audit.brand}
          onChangeText={(brand) => updateAuditFields({ brand })}
          placeholder="Your brand name"
        />
        <FieldInput
          label="Category"
          value={audit.category}
          onChangeText={(category) => updateAuditFields({ category })}
          placeholder="e.g. Solar EPC · Commercial & industrial"
        />
        <FieldInput
          label="Primary market"
          value={audit.market}
          onChangeText={(market) => updateAuditFields({ market })}
          placeholder="e.g. India — national"
        />

        <View style={styles.compWrap}>
          <Text style={styles.compLabel}>Competitor set</Text>
          <View style={styles.chips}>
            {audit.competitors.map((c) => (
              <Chip key={c} label={c} onRemove={() => removeCompetitor(c)} />
            ))}
            {addingCompetitor ? (
              <FieldInput
                label=""
                value={competitorDraft}
                onChangeText={setCompetitorDraft}
                placeholder="Competitor name"
              />
            ) : audit.competitors.length < 5 ? (
              <Chip label="+ Add" accent onPress={() => setAddingCompetitor(true)} />
            ) : null}
          </View>
          {addingCompetitor ? (
            <PrimaryButton label="Add competitor" onPress={commitCompetitor} />
          ) : null}
        </View>

        <View style={styles.tierWrap}>
          <Text style={styles.compLabel}>Research depth</Text>
          {TIERS.map((t) => {
            const selected = audit.researchTier === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setResearchTier(t.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t.label}
                style={[styles.tierRow, selected && styles.tierRowSelected]}
              >
                <View style={[styles.tierDot, selected && styles.tierDotSelected]} />
                <View style={styles.tierText}>
                  <Text style={[styles.tierLabel, selected && styles.tierLabelSelected]}>{t.label}</Text>
                  <Text style={styles.tierBody}>{t.body}</Text>
                </View>
              </Pressable>
            );
          })}
          {audit.researchTier !== 'quick' ? (
            <FieldInput
              label="Website (optional, sharpens research)"
              value={audit.website}
              onChangeText={(website) => updateAuditFields({ website })}
              placeholder="https://yourcompany.com"
            />
          ) : null}
        </View>

        <View style={styles.cta}>
          <PrimaryButton
            label="Begin — 12 minutes"
            disabled={!canBegin}
            onPress={() => navigation.navigate('assessment')}
          />
          <Text style={styles.ctaNote}>
            Answers are saved as you go. You can hand a section to a colleague.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 16 },
  note: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.home,
    lineHeight: 22,
    color: color.bodyText,
  },
  compWrap: { gap: 9 },
  compLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.fieldLabel,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(244,240,226,0.45)',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierWrap: { gap: 9 },
  tierRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.18)',
    padding: 14,
  },
  tierRowSelected: {
    backgroundColor: 'rgba(240,217,138,0.1)',
    borderColor: 'rgba(240,217,138,0.5)',
  },
  tierDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.4)',
    marginTop: 2,
  },
  tierDotSelected: {
    backgroundColor: color.gold,
    borderColor: color.gold,
  },
  tierText: { flex: 1, gap: 3 },
  tierLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.field,
    color: color.cream,
  },
  tierLabelSelected: { color: color.goldBright },
  tierBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.dimLabel,
    lineHeight: 18,
    color: color.mutedText,
  },
  cta: { marginTop: 'auto', gap: 10 },
  ctaNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.scoreLabel,
    lineHeight: 17,
    color: color.legalText,
  },
});
