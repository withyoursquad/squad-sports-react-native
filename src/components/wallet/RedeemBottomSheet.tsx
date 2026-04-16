/**
 * RedeemBottomSheet.tsx
 * Bottom sheet for redeeming a coupon (progress checklist + action button).
 * Ported from squad-demo/src/components/wallet/RedeemBottomSheet.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import {
  BodyRegular,
  BodySmall,
  TitleMedium,
} from '../ux/text/Typography';

export type TriggerCondition = {
  type: string;
  count: number;
};

export type TriggerRules = {
  operator: 'AND' | 'OR';
  conditions: TriggerCondition[];
};

export type ConditionProgress = {
  current: number;
  target: number;
  fraction: number;
};

export type RedeemBottomSheetProps = {
  /** The coupon being redeemed. */
  coupon: {
    id: string;
    code?: string;
    description?: string;
    unlockDescription?: string;
  };
  /** Whether the coupon is locked. */
  isLocked?: boolean;
  /** Parsed trigger rules for display. */
  rules?: TriggerRules | null;
  /** Progress state for each condition. */
  conditionProgressList?: Array<{
    condition: TriggerCondition;
    progress: ConditionProgress;
  }>;
  /** Called when the user confirms / dismisses. */
  onConfirm?: () => void;
  /** Called when the sheet should close. */
  onDismiss?: () => void;
  /** Labels for event types. */
  eventTypeLabels?: Record<string, string>;
};

export default function RedeemBottomSheet({
  coupon,
  isLocked = false,
  rules,
  conditionProgressList,
  onConfirm,
  onDismiss,
  eventTypeLabels = {},
}: RedeemBottomSheetProps) {
  const handlePress = () => {
    onDismiss?.();
    if (!isLocked) {
      onConfirm?.();
    }
  };

  return (
    <View style={styles.content}>
      <TitleMedium style={styles.title}>Earn It</TitleMedium>

      <BodyRegular style={styles.description}>
        {coupon.unlockDescription ||
          'No shortcuts. Keep working in the lab to unlock discount code.'}
      </BodyRegular>

      {isLocked && rules && conditionProgressList && (
        <View style={styles.checklist}>
          <BodySmall style={styles.operatorHint}>
            {rules.operator === 'AND' ? 'Complete all:' : 'Complete any one:'}
          </BodySmall>
          {conditionProgressList.map(({ condition, progress }, index) => {
            const done = progress.fraction >= 1;
            return (
              <View key={index} style={styles.conditionRow}>
                <BodyRegular
                  style={[styles.checkIcon, done && styles.checkIconDone]}
                >
                  {done ? '\u2713' : '\u25CB'}
                </BodyRegular>
                <View style={styles.conditionInfo}>
                  <BodyRegular
                    style={[
                      styles.conditionLabel,
                      done && styles.conditionLabelDone,
                    ]}
                  >
                    {eventTypeLabels[condition.type] || condition.type}
                  </BodyRegular>
                  <BodySmall style={styles.conditionCount}>
                    {`${progress.current}/${progress.target}`}
                  </BodySmall>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Button style={styles.button} onPress={handlePress}>
        <BodyRegular style={styles.buttonText}>Bet, got it</BodyRegular>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.gray1,
    paddingVertical: 14,
  },
  checkIcon: {
    color: Colors.gray6,
    marginRight: 10,
    fontSize: 16,
  },
  checkIconDone: {
    color: Colors.green,
  },
  checklist: {
    width: '100%',
    marginBottom: 24,
  },
  conditionCount: {
    color: Colors.gray6,
  },
  conditionInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionLabel: {
    color: Colors.white,
  },
  conditionLabelDone: {
    color: Colors.gray6,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  description: {
    textAlign: 'center',
    color: Colors.gray6,
    marginBottom: 24,
    width: '90%',
  },
  operatorHint: {
    color: Colors.gray6,
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    color: Colors.white,
    marginBottom: 12,
  },
});
