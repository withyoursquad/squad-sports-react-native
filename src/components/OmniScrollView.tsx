/**
 * OmniScrollView — heterogeneous scroll view built from "Slivers".
 * Ported from squad-demo/src/components/OmniScrollView.tsx.
 */
import React, { JSXElementConstructor, ReactElement, useCallback } from 'react';
import { FlatList, RefreshControl, ViewStyle } from 'react-native';
import { Colors } from '../theme/ThemeContext';

type NodeToMakeFlatListHappy = ReactElement<any, string | JSXElementConstructor<any>> | null;
type DataChildBuilder<T> = (item: T) => NodeToMakeFlatListHappy;
type IndexedChildBuilder = (index: number) => NodeToMakeFlatListHappy;
type SingleChildBuilder = () => NodeToMakeFlatListHappy;

function noopBuilder() {
  return null;
}

export interface OmniScrollViewSliver {
  size: number;
  render: IndexedChildBuilder;
  extractKey: (index: number) => React.Key;
}

export class OmniScrollViewFixedChildSliver implements OmniScrollViewSliver {
  size: number = 1;
  builder: SingleChildBuilder;
  key: React.Key;

  constructor(key: React.Key, builder?: SingleChildBuilder) {
    this.key = key;
    this.builder = builder ?? noopBuilder;
  }

  render(): NodeToMakeFlatListHappy {
    return this.builder();
  }

  extractKey(_index: number) {
    return this.key;
  }
}

export class OmniScrollViewBuilderSliver<T> implements OmniScrollViewSliver {
  data: Array<T>;
  builder: DataChildBuilder<T>;
  keyExtractor: (data: T) => React.Key;

  constructor({
    data,
    extractKey,
    builder,
  }: {
    data: Array<T>;
    extractKey: (data: T) => React.Key;
    builder: DataChildBuilder<T>;
  }) {
    this.data = data;
    this.keyExtractor = extractKey;
    this.builder = builder;
  }

  get size(): number {
    return this.data.length;
  }

  render(index: number): NodeToMakeFlatListHappy {
    return this.builder(this.data[index]!);
  }

  extractKey(index: number) {
    return this.keyExtractor(this.data[index]!);
  }
}

type OmniScrollViewData = {
  sliver: OmniScrollViewSliver;
  index: number;
};

function compileListData(slivers: Array<OmniScrollViewSliver>): Array<OmniScrollViewData> {
  const totalSize = slivers.reduce((sum, sliver) => sum + sliver.size, 0);
  const data = new Array(totalSize);

  let indexWithinData = 0;
  let indexToSlivers = 0;
  let indexWithinSliver = 0;

  while (indexWithinData < totalSize) {
    const sliver = slivers[indexToSlivers];

    if (sliver && sliver.size > indexWithinSliver) {
      data[indexWithinData] = {
        sliver: slivers[indexToSlivers],
        index: indexWithinSliver,
      };
      indexWithinData++;
      indexWithinSliver++;
    } else {
      indexToSlivers++;
      indexWithinSliver = 0;
    }
  }

  return data;
}

type OmniScrollViewProps = {
  slivers: Array<OmniScrollViewSliver>;
  onScroll?: (event: any) => void;
  onRefresh?: () => Promise<void>;
  style?: ViewStyle;
};

export function OmniScrollView({ slivers, onScroll, onRefresh, style }: OmniScrollViewProps) {
  const data = compileListData(slivers);
  const [refreshing, setRefreshing] = React.useState(false);

  const renderItem = useCallback(({ item }: { item: OmniScrollViewData }): React.ReactElement | null => {
    if (!item?.sliver) return null;
    return item.sliver.render(item.index);
  }, []);

  const keyExtractor = useCallback((item: OmniScrollViewData, _index: number) => {
    if (!item?.sliver) return `error-${_index}`;
    return item.sliver.extractKey(item.index).toString();
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  return (
    <FlatList
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      data={data}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={style}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.white}
            colors={[Colors.purple1]}
          />
        ) : undefined
      }
    />
  );
}
