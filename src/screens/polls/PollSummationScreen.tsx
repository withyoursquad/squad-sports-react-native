/**
 * Poll summation/results screen.
 * Ported from squad-demo/src/screens/PollSummation.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { PollUserReaction, PollSummationSelector } from '../../components/poll/PollComponents';
import { TitleSmall, BodyRegular, BodySmall } from '../../components/ux/text/Typography';

export function PollSummationScreen() {
  const route = useRoute<any>();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const pollId = route.params?.pollId;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const polls = await apiClient.getActivePolls();
        const poll = polls?.polls?.find((p: any) => p.id === pollId);
        if (poll) {
          setQuestion((poll as any).question ?? '');
          setOptions((poll as any).options ?? []);
          setTotalVotes((poll as any).totalVotes ?? 0);
        }
      } catch {}
    };
    load();
  }, [pollId, apiClient]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Poll Results" />

      <View style={styles.content}>
        <TitleSmall style={styles.question}>{question}</TitleSmall>
        <BodySmall style={styles.totalVotes}>{totalVotes} total votes</BodySmall>

        {options.map((opt: any) => (
          <View key={opt.id} style={styles.optionRow}>
            <View style={styles.optionHeader}>
              <BodyRegular style={styles.optionText}>{opt.text}</BodyRegular>
              <BodySmall style={styles.optionPercent}>{Math.round(opt.percentage ?? 0)}%</BodySmall>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${opt.percentage ?? 0}%`,
                backgroundColor: theme.buttonColor,
              }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  question: { color: Colors.white, marginBottom: 8 },
  totalVotes: { color: Colors.gray6, marginBottom: 24 },
  optionRow: { marginBottom: 16 },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  optionText: { color: Colors.white },
  optionPercent: { color: Colors.gray6, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: Colors.gray3, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
