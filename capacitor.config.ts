import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.base699f47a86e7e0a874d1159ed.app',
  appName: 'Club No Sleep',
  webDir: 'dist',
  server: {
    url: 'https://lalatoto.base44.app',
    allowNavigation: [
      'lalatoto.base44.app',
      'clubnosleep.com',
      'app.base44.com',
      'base44.app',
    ],
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
