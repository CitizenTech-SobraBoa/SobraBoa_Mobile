import { useState, type PropsWithChildren } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const LEAF_RATIO = 1200 / 751;

export function GreenHeader({
  children,
  paddingTop = 16,
  paddingBottom = 28,
  leaf = true,
}: PropsWithChildren<{ paddingTop?: number; paddingBottom?: number; leaf?: boolean }>) {
  const insets = useSafeAreaInsets();
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const leafWidth = box ? Math.max(box.width, box.height * LEAF_RATIO) : 0;
  const imageStyle = box
    ? leaf
      ? { top: 0, right: 0, width: leafWidth, height: leafWidth / LEAF_RATIO }
      : { top: 0, left: 0, width: box.width, height: box.height }
    : null;
  return (
    <View
      style={[s.header, { paddingTop: insets.top + paddingTop, paddingBottom }]}
      onLayout={(e) => setBox(e.nativeEvent.layout)}
    >
      {imageStyle && (
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={
            leaf
              ? require('../../assets/images/account-header.jpg')
              : require('../../assets/images/header-gradient.jpg')
          }
          resizeMode="cover"
          style={[s.image, imageStyle]}
        />
      )}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    backgroundColor: colors.green,
    overflow: 'hidden',
    gap: 6,
  },
  image: { position: 'absolute' },
});
