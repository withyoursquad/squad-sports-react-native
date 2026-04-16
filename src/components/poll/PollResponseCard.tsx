/**
 * PollResponseCard — Shows a user's poll response with their avatar,
 * the prompt, and the chosen option image + label.
 * Ported from squad-demo ResponseCard.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../theme/ThemeContext';
import { TitleTiny } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';
import PollTag from './PollTag';

export interface PollResponseUser {
  id: string;
  displayName?: string;
  imageUrl?: string;
}

export interface PollResponseOption {
  label: string;
  imageUrl?: string;
}

export interface PollResponseCardData {
  id: string;
  prompt: string;
  theme?: string;
  communityTag?: string;
  options?: PollResponseOption[];
}

interface PollResponseCardProps {
  poll: PollResponseCardData;
  /** The option index that the user chose */
  pollOptionId: number;
  user: PollResponseUser;
  /** Whether to blur the answer (user hasn't answered yet) */
  blur?: boolean;
  onPress?: () => void;
}

export default function PollResponseCard({
  poll,
  pollOptionId,
  user,
  blur = false,
}: PollResponseCardProps) {
  const chosenOption = poll.options?.[pollOptionId];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserImage
          size={40}
          imageUrl={user.imageUrl}
          displayName={user.displayName}
        />
        <View style={styles.metadata}>
          <TitleTiny style={styles.prompt}>{poll.prompt}</TitleTiny>
          <View style={styles.metadataTime}>
            <PollTag label={poll.theme ?? 'Daily Poll'} communityTag={poll.communityTag} />
          </View>
        </View>
      </View>

      <View style={blur ? styles.answerBlurred : undefined}>
        <View style={styles.answer}>
          <View style={styles.answerImage}>
            {chosenOption?.imageUrl ? (
              <Image
                source={{ uri: chosenOption.imageUrl }}
                contentFit="contain"
                style={styles.image}
              />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </View>
          <TitleTiny style={styles.answerLabel}>
            {chosenOption?.label ?? ''}
          </TitleTiny>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  answer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 8,
    justifyContent: 'center',
    padding: 16,
    width: '100%',
  },
  answerBlurred: {
    opacity: 0.15,
  },
  answerImage: {
    backgroundColor: Colors.white,
    borderRadius: 44,
    height: 88,
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerLabel: {
    alignSelf: 'center',
    color: Colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    height: '80%',
    width: '80%',
  },
  imagePlaceholder: {
    height: '60%',
    width: '60%',
    backgroundColor: Colors.gray3,
    borderRadius: 30,
  },
  metadata: {
    flex: 1,
    marginLeft: 10,
    marginRight: 15,
  },
  metadataTime: {
    flexDirection: 'row',
  },
  prompt: {
    color: Colors.white,
  },
});
