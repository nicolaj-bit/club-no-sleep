// Tekster, der før stod hardkodet på dansk ude i komponenterne.
//
// De gik aldrig gennem sprogvalget, så de blev stående på dansk, selv om
// brugeren havde valgt engelsk. De flyttes hertil efterhånden, som de bliver
// fundet. Filen ligger for sig, fordi LanguageContext.jsx allerede er på
// omkring 2.500 linjer og har en grænse at tage hensyn til.
//
// Pladsholdere skrives som {navn} og udskiftes på kaldstedet:
//   t.authResetLinkSent.replace('{email}', email)

export const uiDa = {
  // Login og oprettelse (NativeAuthScreen)
  authFillEmailPassword: 'Udfyld email og adgangskode',
  authLoginFailed: 'Login mislykkedes. Tjek email og adgangskode.',
  authPasswordMin8: 'Adgangskoden skal være mindst 8 tegn',
  authPasswordsDiffer: 'Adgangskoderne er ikke ens',
  authCodeSent: 'Vi har sendt en kode til din email. Indtast den herunder for at bekræfte din konto.',
  authSignupFailed: 'Oprettelse mislykkedes. Prøv igen.',
  authEnterCodeFromEmail: 'Indtast koden fra din email',
  authLoginAfterConfirmFailed: 'Login mislykkedes efter bekræftelse',
  authCodeWrongOrExpired: 'Koden er forkert eller udløbet. Prøv igen.',
  authNewCodeSent: 'Vi har sendt en ny kode til din email.',
  authResendFailed: 'Kunne ikke sende koden igen. Prøv senere.',
  authEnterYourEmail: 'Indtast din email',
  authResetLinkSent: 'Vi har sendt et link til at nulstille din adgangskode til {email}.',
  authResetLinkFailed: 'Kunne ikke sende nulstillingslink. Prøv igen.',
  authPasswordReset: 'Din adgangskode er nulstillet. Log ind med den nye adgangskode.',
  authLinkExpired: 'Linket er udløbet eller ugyldigt. Anmod om et nyt.',
  authAppleFailed: 'Apple login mislykkedes. Prøv igen.',
  authConfirmPassword: 'Bekræft adgangskode',
  authConfirmNewPassword: 'Bekræft ny adgangskode',
  authSaveNewPassword: 'Gem ny adgangskode',
  authResetIntro: 'Indtast din email, og vi sender dig et link til at nulstille din adgangskode.',
  authCodeSentTo: 'Vi har sendt en kode til {email}. Indtast den herunder.',
  authConfirm: 'Bekræft',

  // Billeder (savePhotoToLibrary)
  photoNoAccess: 'Vi har ikke adgang til dine billeder. Du kan give adgang under Indstillinger.',
  photoSaved: 'Gemt i dine billeder',

  // Søvnlogsnotifikation (sleepNotifications)
  sleepNotifChildAwake: 'Barnet er vågent',
  sleepNotifRunning: 'Søvnlog kører',
};

export const uiEn = {
  // Sign-in and sign-up (NativeAuthScreen)
  authFillEmailPassword: 'Enter your email and password',
  authLoginFailed: 'Sign-in failed. Check your email and password.',
  authPasswordMin8: 'Your password must be at least 8 characters',
  authPasswordsDiffer: 'The passwords do not match',
  authCodeSent: 'We have sent a code to your email. Enter it below to confirm your account.',
  authSignupFailed: 'Sign-up failed. Please try again.',
  authEnterCodeFromEmail: 'Enter the code from your email',
  authLoginAfterConfirmFailed: 'Sign-in failed after confirmation',
  authCodeWrongOrExpired: 'That code is wrong or has expired. Please try again.',
  authNewCodeSent: 'We have sent a new code to your email.',
  authResendFailed: 'We could not send the code again. Please try later.',
  authEnterYourEmail: 'Enter your email',
  authResetLinkSent: 'We have sent a link to reset your password to {email}.',
  authResetLinkFailed: 'We could not send the reset link. Please try again.',
  authPasswordReset: 'Your password has been reset. Sign in with your new password.',
  authLinkExpired: 'That link has expired or is invalid. Please request a new one.',
  authAppleFailed: 'Apple sign-in failed. Please try again.',
  authConfirmPassword: 'Confirm password',
  authConfirmNewPassword: 'Confirm new password',
  authSaveNewPassword: 'Save new password',
  authResetIntro: 'Enter your email and we will send you a link to reset your password.',
  authCodeSentTo: 'We have sent a code to {email}. Enter it below.',
  authConfirm: 'Confirm',

  // Photos (savePhotoToLibrary)
  photoNoAccess: 'We do not have access to your photos. You can grant access in Settings.',
  photoSaved: 'Saved to your photos',

  // Sleep log notification (sleepNotifications)
  sleepNotifChildAwake: 'Baby is awake',
  sleepNotifRunning: 'Sleep log running',
};
