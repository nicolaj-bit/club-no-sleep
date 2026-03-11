import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  da: {
    // Nav
    home: 'Hjem',
    menu: 'Menu',
    shop: 'Shop',
    blog: 'Blog',
    sleepLog: 'Søvnlog',
    knowledge: 'Viden',
    community: 'Community',
    profile: 'Profil',

    // Home
    goodDay: 'God dag, mor 🤍',
    dailyWord: 'Dagens ord til dig',
    fromBlog: 'Fra bloggen',
    seeAll: 'Se alle →',
    affirmations: [
      "You are a wonderful mom — even on the days it doesn't feel that way. 🤍",
      "It's okay that the coffee is cold. You are warm and present, and that is enough.",
      "You don't need to do everything perfectly. You just need to do your best — and you are.",
      "Sleep deprivation is hard. The fact that you keep going is proof of your incredible strength.",
      "Your baby doesn't know what 'perfect' is. They only know they love you.",
      "Those who say motherhood is easy have never tried it. You've got this!",
      "Every little smile from your child is proof that you're doing it right.",
      "You are not alone. Thousands of moms are sitting right now feeling exactly the same.",
      "It's okay to need help. Asking for it is actually brave.",
      "Today you are enough. Tomorrow you are enough. Always you are enough.",
      "Your tears are not weakness — they are love that has overflowed.",
      "No handbook can prepare you for the love you feel. You are strong.",
      "You have done something incredible. You have created a human being. Remember that.",
      "Some days it's enough that everyone is alive and reasonably fed. 🙌",
      "You are your baby's favourite person in the whole world. Always.",
      "Even though you're tired, you are still there. That is love in its purest form.",
      "No mother is perfect. But you are the perfect mother for your child.",
      "A good mother is not one who never fails — but one who always tries again.",
      "Congratulations on surviving another night. You deserve a medal (and more coffee).",
      "Your love is the warmest place your child knows. 🧡",
      "Even the hard days shape you both into something stronger.",
      "You are more than 'just a mom'. You are an everyday hero.",
      "What you give your child today, they carry with them all their life.",
      "A barely-making-it day is still a day full of love.",
      "You handle more than you know. That is the most beautiful thing about you.",
      "Every hug, every feed, every sleep attempt — it counts.",
      "Motherhood is not a performance. It's a relationship. And yours is beautiful.",
      "You have not failed. You are in the middle of it.",
      "Tomorrow is a new chance. And you are already ready for it.",
      "You carry so much. But you carry it with love.",
    ],

    // Profile
    profileTitle: 'Profil',
    edit: 'Rediger',
    editProfile: 'Rediger profil',
    username: 'Brugernavn',
    displayName: 'Visningsnavn',
    city: 'By',
    childBirthdate: 'Barnets fødselsdag',
    wonderWeekInfo: 'Bruges til beregning af tigerspring 🐯',
    saveChanges: 'Gem ændringer',
    saving: 'Gemmer…',
    profileUpdated: 'Profil opdateret',
    favorites: 'Favoritter',
    notifications: 'Notifikationer',
    questions: 'Spørgsmål',
    settings: 'Indstillinger',
    help: 'Hjælp',
    shareLocation: 'Del lokation',
    showAsVisible: 'Vis mig som synlig',
    logOut: 'Log ud',
    language: 'Sprog',
    chooseLanguage: 'Vælg sprog',

    // Settings
    settingsTitle: 'Indstillinger',
    password: 'Adgangskode',
    privacy: 'Privatliv',
    theme: 'Tema',
    chooseTheme: 'Vælg dit foretrukne look',
    light: 'Lys',
    dark: 'Mørk',
    faq: 'Ofte stillede spørgsmål',
    contactSupport: 'Kontakt support',
    deleteAccount: 'Slet konto',
    blogAndArticles: 'Blog & Artikler',
    changePassword: 'Skift adgangskode',
    currentPassword: 'Nuværende adgangskode',
    newPassword: 'Ny adgangskode',
    confirmPassword: 'Bekræft ny adgangskode',
    updatePassword: 'Opdater adgangskode',
    passwordMismatch: 'Adgangskoderne matcher ikke',
    passwordUpdated: 'Adgangskode opdateret',
    deleteWarning: 'Er du sikker? Denne handling kan ikke fortrydes — al din data slettes permanent.',
    typeToConfirmDelete: 'Skriv SLET for at bekræfte',
    deleteConfirmWord: 'SLET',
    deletePermanently: 'Slet min konto permanent',
    faqQ1: 'Hvordan ændrer jeg min profil?',
    faqA1: 'Gå til din profil og tryk på "Rediger".',
    faqQ2: 'Hvordan finder jeg en behandler?',
    faqA2: 'Find en behandler under Community-fanen.',

    // Knowledge
    knowledgeTitle: 'Viden & Svar',
    searchPlaceholder: 'Søg i viden...',
    articles: 'Artikler',
    noResults: 'Ingen resultater for',
    noFaq: 'Ingen FAQ endnu',
    noQuestions: 'Ingen spørgsmål endnu',
    askQuestion: 'Stil et spørgsmål',
    answered: 'Besvaret',
    open: 'Åben',
    by: 'af',
    answers: 'svar',

    // Community / shared
    version: 'Version 1.0.0',
    v1: 'v1.0',
  },

  en: {
    // Nav
    home: 'Home',
    menu: 'Menu',
    shop: 'Shop',
    blog: 'Blog',
    sleepLog: 'Sleep log',
    knowledge: 'Knowledge',
    community: 'Community',
    profile: 'Profile',

    // Home
    goodDay: 'Good day, mom 🤍',
    dailyWord: "Today's word for you",
    fromBlog: 'From the blog',
    seeAll: 'See all →',
    affirmations: [
      "You are a wonderful mom — even on the days it doesn't feel that way. 🤍",
      "It's okay that the coffee is cold. You are warm and present, and that is enough.",
      "You don't need to do everything perfectly. You just need to do your best — and you are.",
      "Sleep deprivation is hard. The fact that you keep going is proof of your incredible strength.",
      "Your baby doesn't know what 'perfect' is. They only know they love you.",
      "Those who say motherhood is easy have never tried it. You've got this!",
      "Every little smile from your child is proof that you're doing it right.",
      "You are not alone. Thousands of moms are sitting right now feeling exactly the same.",
      "It's okay to need help. Asking for it is actually brave.",
      "Today you are enough. Tomorrow you are enough. Always you are enough.",
      "Your tears are not weakness — they are love that has overflowed.",
      "No handbook can prepare you for the love you feel. You are strong.",
      "You have done something incredible. You have created a human being. Remember that.",
      "Some days it's enough that everyone is alive and reasonably fed. 🙌",
      "You are your baby's favourite person in the whole world. Always.",
      "Even though you're tired, you are still there. That is love in its purest form.",
      "No mother is perfect. But you are the perfect mother for your child.",
      "A good mother is not one who never fails — but one who always tries again.",
      "Congratulations on surviving another night. You deserve a medal (and more coffee).",
      "Your love is the warmest place your child knows. 🧡",
      "Even the hard days shape you both into something stronger.",
      "You are more than 'just a mom'. You are an everyday hero.",
      "What you give your child today, they carry with them all their life.",
      "A barely-making-it day is still a day full of love.",
      "You handle more than you know. That is the most beautiful thing about you.",
      "Every hug, every feed, every sleep attempt — it counts.",
      "Motherhood is not a performance. It's a relationship. And yours is beautiful.",
      "You have not failed. You are in the middle of it.",
      "Tomorrow is a new chance. And you are already ready for it.",
      "You carry so much. But you carry it with love.",
    ],

    // Profile
    profileTitle: 'Profile',
    edit: 'Edit',
    editProfile: 'Edit profile',
    username: 'Username',
    displayName: 'Display name',
    city: 'City',
    childBirthdate: "Child's birthday",
    wonderWeekInfo: 'Used to calculate wonder weeks 🐯',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    profileUpdated: 'Profile updated',
    favorites: 'Favorites',
    notifications: 'Notifications',
    questions: 'Questions',
    settings: 'Settings',
    help: 'Help',
    shareLocation: 'Share location',
    showAsVisible: 'Show me as visible',
    logOut: 'Log out',
    language: 'Language',
    chooseLanguage: 'Choose language',

    // Settings
    settingsTitle: 'Settings',
    password: 'Password',
    privacy: 'Privacy',
    theme: 'Theme',
    chooseTheme: 'Choose your preferred look',
    light: 'Light',
    dark: 'Dark',
    faq: 'Frequently asked questions',
    contactSupport: 'Contact support',
    deleteAccount: 'Delete account',
    blogAndArticles: 'Blog & Articles',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    updatePassword: 'Update password',
    passwordMismatch: 'Passwords do not match',
    passwordUpdated: 'Password updated',
    deleteWarning: 'Are you sure? This action cannot be undone — all your data will be permanently deleted.',
    typeToConfirmDelete: 'Type DELETE to confirm',
    deleteConfirmWord: 'DELETE',
    deletePermanently: 'Delete my account permanently',
    faqQ1: 'How do I edit my profile?',
    faqA1: 'Go to your profile and tap "Edit".',
    faqQ2: 'How do I find a practitioner?',
    faqA2: 'Find a practitioner under the Community tab.',

    // Knowledge
    knowledgeTitle: 'Knowledge & Answers',
    searchPlaceholder: 'Search knowledge...',
    articles: 'Articles',
    noResults: 'No results for',
    noFaq: 'No FAQ yet',
    noQuestions: 'No questions yet',
    askQuestion: 'Ask a question',
    answered: 'Answered',
    open: 'Open',
    by: 'by',
    answers: 'answers',

    // Community / shared
    version: 'Version 1.0.0',
    v1: 'v1.0',
  },
};

const LanguageContext = createContext({
  lang: 'da',
  t: translations.da,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app-language') || 'da';
  });

  const setLang = (newLang) => {
    localStorage.setItem('app-language', newLang);
    setLangState(newLang);
  };

  const t = translations[lang] || translations.da;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}