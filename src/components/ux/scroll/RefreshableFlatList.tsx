/**
 * FlatList with built-in pull-to-refresh.
 * Ported from squad-demo/src/components/ux/scroll/RefreshableFlatList.tsx.
 */
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, type FlatListProps } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface RefreshableFlatListProps<T> extends FlatListProps<T> {
  onRefresh: () => Promise<void>;
}

export default function RefreshableFlatList<T>({ onRefresh, ...props }: RefreshableFlatListProps<T>) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  return (
    <FlatList
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.white}
          colors={[Colors.purple1]}
        />
      }
    />
  );
}
