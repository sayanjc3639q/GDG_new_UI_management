export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '810410889730-7812nd1mf873nsrf2ogflrs52a41618p.apps.googleusercontent.com',
  appName: 'GDG Management Platform',
  chapterName: 'GDG on Campus HIT',
} as const;
