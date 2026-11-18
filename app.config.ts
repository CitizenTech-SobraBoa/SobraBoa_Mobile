import type { ExpoConfig } from 'expo/config';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

function referenceCommit(): string | null {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) return process.env.EAS_BUILD_GIT_COMMIT_HASH;
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    if (
      ![process.cwd(), path.dirname(process.cwd())].some(
        (p) => path.resolve(p) === path.resolve(root),
      )
    )
      return null;
    const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
    if (dirty) return null;
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const config: ExpoConfig = {
  name: 'SobraBoa',
  slug: 'sobraboa',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/images/icon.png',
  android: {
    package: 'br.com.fiap.sobraboa.mobile',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#154D3D',
    },
    softwareKeyboardLayoutMode: 'resize',
  },
  plugins: [
    'expo-secure-store',
    'expo-font',
    [
      'expo-location',
      { locationWhenInUsePermission: 'Permita localizar doações próximas a você.' },
    ],
    [
      'expo-splash-screen',
      { image: './assets/images/splash.png', imageWidth: 200, backgroundColor: '#F6F7F1' },
    ],
  ],
  extra: {
    referenceCommit: referenceCommit(),
    eas: { projectId: '6e879e67-9e13-48d4-8852-3753c567be8d' },
  },
};
export default config;
