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
      "Du er en vidunderlig mor — selv på dage hvor det ikke føles sådan. 🤍",
      "Det er okay at kaffen er kold. Du er varm og til stede, og det er nok.",
      "Du behøver ikke at gøre alt perfekt. Du behøver bare at gøre dit bedste — og det gør du.",
      "Søvnmangel er hårdt. At du holder ved er bevis på din utrolige styrke.",
      "Dit barn ved ikke hvad 'perfekt' betyder. De ved bare at de elsker dig.",
      "De der siger at moderskab er nemt, har aldrig prøvet det. Du klarer dette!",
      "Ethvert lille smil fra dit barn er bevis på at du gør det rigtigt.",
      "Du er ikke alene. Tusinder af mødre sidder lige nu og føler præcis det samme.",
      "Det er okay at have brug for hjælp. At bede om den er faktisk modig.",
      "I dag er du nok. I morgen er du nok. Altid er du nok.",
      "Dine tårer er ikke svaghed — de er kærlighed der er overløbet.",
      "Ingen håndbok kan forberede dig på den kærlighed du føler. Du er stærk.",
      "Du har gjort noget utroligt. Du har skabt et menneske. Husk det.",
      "Nogle dage er det nok at alle lever og er relativt mætte. 🙌",
      "Du er dit babys yndlingsperson i hele verden. Altid.",
      "Selvom du er træt, er du stadig der. Det er kærlighed i sin reneste form.",
      "Ingen mor er perfekt. Men du er den perfekte mor for dit barn.",
      "En god mor er ikke en der aldrig fejler — men en der altid prøver igen.",
      "Tillykke fordi du overlevede endnu en nat. Du fortjener en medalje (og mere kaffe).",
      "Din kærlighed er det varmeste sted dit barn kender. 🧡",
      "Selv de svære dage formes jer begge til noget stærkere.",
      "Du er meget mere end 'bare en mor'. Du er en hverdagshelt.",
      "Det du giver dit barn i dag, bærer de med sig hele deres liv.",
      "En dag hvor du næppe klarer det, er stadig en dag fuld af kærlighed.",
      "Du håndterer mere end du ved. Det er det smukkeste ved dig.",
      "Ethvert kram, hver amning, hvert søvnforsøg — det tæller.",
      "Moderskab er ikke en præstation. Det er et forhold. Og dit er smukt.",
      "Du har ikke fejlet. Du er midt i det.",
      "I morgen er en ny chance. Og du er allerede klar til det.",
      "Du bærer så meget. Men du bærer det med kærlighed.",
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

    // Shop
    shopTitle: 'Shop',
    searchProducts: 'Søg produkter...',
    noProducts: 'Ingen produkter fundet',
    sortBy: 'Sorter efter',
    newest: 'Nyeste',
    priceLow: 'Pris: Lav til høj',
    priceHigh: 'Pris: Høj til lav',
    filtersTitle: 'Filtre & Sortering',
    outOfStock: 'Udsolgt',
    catAll: 'Alle',
    catCare: 'Pleje',
    catAccessories: 'Tilbehør',
    catEquipment: 'Udstyr',
    catBooks: 'Bøger',

    // Blog
    blogTitle: 'Blog',
    searchBlog: 'Søg indlæg...',
    noPosts: 'Ingen indlæg fundet',
    allCategories: 'Alle',

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

    // Shop
    shopTitle: 'Shop',
    searchProducts: 'Search products...',
    noProducts: 'No products found',
    sortBy: 'Sort by',
    newest: 'Newest',
    priceLow: 'Price: Low to high',
    priceHigh: 'Price: High to low',
    filtersTitle: 'Filters & Sorting',
    outOfStock: 'Out of stock',
    catAll: 'All',
    catCare: 'Care',
    catAccessories: 'Accessories',
    catEquipment: 'Equipment',
    catBooks: 'Books',

    // Blog
    blogTitle: 'Blog',
    searchBlog: 'Search posts...',
    noPosts: 'No posts found',
    allCategories: 'All',

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