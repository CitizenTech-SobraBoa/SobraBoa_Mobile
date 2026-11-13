import { useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_GAP = 8;

export function useTabBarSpace() {
  const barHeight = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (!barHeight || keyboard) return 0;
  return barHeight + insets.bottom + TAB_BAR_GAP;
}
