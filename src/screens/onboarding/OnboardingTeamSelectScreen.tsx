import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient, useSquadSDK } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import Button from '../../components/ux/buttons/Button';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { BodyRegular, TitleSmall } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingTeamSelect'>;

interface CommunityItem {
  id: string;
  name: string;
  color?: string;
}

export function OnboardingTeamSelectScreen() {
  const navigation = useNavigation<Nav>();
  const sdk = useSquadSDK();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const partnerCommunityId = sdk.config.partnerAuth?.communityId;

  useEffect(() => {
    // If partner has a fixed community, auto-select and skip
    if (partnerCommunityId) {
      (async () => {
        try {
          await apiClient.updateUserCommunity({ id: partnerCommunityId });
          navigation.navigate('OnboardingAccountSetup');
        } catch (err) {
          console.error('[TeamSelect] Error auto-setting partner community:', err);
          setLoading(false);
        }
      })();
      return;
    }

    const fetchCommunities = async () => {
      try {
        const result = await apiClient.fetchAllCommunities();
        if (result?.communities) {
          setCommunities(
            result.communities.map(c => ({
              id: c.id ?? '',
              name: c.name,
              color: c.color,
            })),
          );
        }
      } catch (err) {
        console.error('[TeamSelect] Error fetching communities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [apiClient, partnerCommunityId, navigation]);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selected) return;

    try {
      await apiClient.updateUserCommunity({ id: selected });
      navigation.navigate('OnboardingAccountSetup');
    } catch (err) {
      console.error('[TeamSelect] Error setting community:', err);
    }
  }, [selected, apiClient, navigation]);

  const renderItem = useCallback(
    ({ item }: { item: CommunityItem }) => (
      <Pressable
        style={[
          styles.communityItem,
          selected === item.id && styles.communityItemSelected,
          selected === item.id && { borderColor: item.color ?? theme.buttonColor },
        ]}
        onPress={() => handleSelect(item.id)}
      >
        <View
          style={[
            styles.colorDot,
            { backgroundColor: item.color ?? Colors.purple1 },
          ]}
        />
        <TitleSmall style={styles.communityName}>{item.name}</TitleSmall>
        {selected === item.id && (
          <Text style={[styles.check, { color: item.color ?? theme.buttonColor }]}>
            {'v'}
          </Text>
        )}
      </Pressable>
    ),
    [selected, theme.buttonColor, handleSelect],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Pick Your Team" />

      <View style={styles.content}>
        <BodyRegular style={styles.subtitle}>
          Choose your team to join their community
        </BodyRegular>

        {loading ? (
          <ActivityIndicator color={Colors.white} style={styles.loader} />
        ) : (
          <FlatList
            data={communities}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          style={[
            styles.button,
            { backgroundColor: selected ? theme.buttonColor : Colors.gray2 },
          ]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text
            style={[
              styles.buttonText,
              { color: selected ? theme.buttonText : Colors.gray6 },
            ]}
          >
            Continue
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    color: Colors.gray6,
    marginBottom: 24,
  },
  loader: {
    marginTop: 48,
  },
  list: {
    gap: 8,
    paddingBottom: 24,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  communityItemSelected: {
    backgroundColor: 'rgba(110, 130, 231, 0.1)',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  communityName: {
    color: Colors.white,
    flex: 1,
  },
  check: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
