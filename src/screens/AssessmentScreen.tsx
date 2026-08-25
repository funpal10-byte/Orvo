import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { QUESTIONS } from '../data/questions';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'assessment'>;

const QUESTIONS_PER_DIMENSION = 3;
const TOTAL_DIMENSIONS = 6;
const TOTAL_QUESTIONS = QUESTIONS.length;

export function AssessmentScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const answerQuestion = useAuditStore((s) => s.answerQuestion);
  const goToQuestionIndex = useAuditStore((s) => s.goToQuestionIndex);

  const index = Math.min(audit.currentIndex, TOTAL_QUESTIONS - 1);
  const question = QUESTIONS[index];
  const dimensionNumber = Math.floor(index / QUESTIONS_PER_DIMENSION) + 1;
  const selected = audit.answers[question.id];

  const onBack = () => {
    if (index === 0) {
      navigation.navigate('setup');
      return;
    }
    goToQuestionIndex(index - 1);
  };

  const onPick = (option: string) => {
    answerQuestion(question.id, option);
    if (index === TOTAL_QUESTIONS - 1) {
      navigation.navigate('scoring');
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`Dimension ${dimensionNumber} of ${TOTAL_DIMENSIONS}`} onBack={onBack} />

      <View style={styles.progressBlock}>
        <ProgressBar pct={((index + 1) / TOTAL_QUESTIONS) * 100} />
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>{question.dimension}</Text>
          <Text style={styles.progressText}>
            Q{index + 1} / {TOTAL_QUESTIONS}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.question}>{question.text}</Text>
        <View style={styles.options}>
          {question.options.map((opt) => {
            const isSelected = selected === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => onPick(opt)}
                accessibilityRole="button"
                accessibilityLabel={opt}
                accessibilityState={{ selected: isSelected }}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.footerNote}>
          Not sure is a valid answer — unknowns are scored as gaps, not penalties.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressBlock: { gap: 8, paddingBottom: 20 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.fieldLabel,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  body: { flex: 1, gap: 22 },
  question: {
    fontFamily: fontFamily.displayMedium,
    fontSize: fontSize.question,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: color.cream,
  },
  options: { gap: 10 },
  option: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.18)',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(240,217,138,0.12)',
    borderColor: 'rgba(240,217,138,0.5)',
  },
  optionText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.body,
    color: color.cream,
    textAlign: 'left',
  },
  footerNote: {
    marginTop: 'auto',
    fontFamily: fontFamily.body,
    fontSize: fontSize.dimValue,
    lineHeight: 18,
    color: 'rgba(244,240,226,0.34)',
  },
});
