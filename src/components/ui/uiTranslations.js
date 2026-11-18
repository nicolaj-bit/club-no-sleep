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
  authLogIn: 'Log ind',
  authLoginIntro: 'Indtast dine oplysninger for at fortsætte',
  authOr: 'eller',
  authPasswordPlaceholder: 'Adgangskode',
  authForgotPasswordQ: 'Glemt adgangskode?',
  authForgotPassword: 'Glemt adgangskode',
  authNoAccount: 'Har du ikke en konto?',
  authCreateAccount: 'Opret bruger',
  authSignupIntro: 'Indtast email og adgangskode for at oprette din konto',
  authPasswordMin8Placeholder: 'Adgangskode (mindst 8 tegn)',
  authHaveAccount: 'Har du allerede en konto?',
  authChooseNewPassword: 'Vælg ny adgangskode',
  authNewPasswordIntro: 'Indtast en ny adgangskode for din konto.',
  authNewPasswordPlaceholder: 'Ny adgangskode (mindst 8 tegn)',
  authConfirmYourEmail: 'Bekræft din email',
  authCodePlaceholder: 'Kode fra email',
  authNoCode: 'Fik du ingen kode?',
  authResend: 'Send igen',
  authTokenMissing: 'Login mislykkedes — intet token modtaget',

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
  authLogIn: 'Sign in',
  authLoginIntro: 'Enter your details to continue',
  authOr: 'or',
  authPasswordPlaceholder: 'Password',
  authForgotPasswordQ: 'Forgot your password?',
  authForgotPassword: 'Forgot password',
  authNoAccount: "Don't have an account?",
  authCreateAccount: 'Create account',
  authSignupIntro: 'Enter your email and password to create your account',
  authPasswordMin8Placeholder: 'Password (at least 8 characters)',
  authHaveAccount: 'Already have an account?',
  authChooseNewPassword: 'Choose a new password',
  authNewPasswordIntro: 'Enter a new password for your account.',
  authNewPasswordPlaceholder: 'New password (at least 8 characters)',
  authConfirmYourEmail: 'Confirm your email',
  authCodePlaceholder: 'Code from email',
  authNoCode: "Didn't get a code?",
  authResend: 'Resend',
  authTokenMissing: 'Sign-in failed — no token received',

  // Photos (savePhotoToLibrary)
  photoNoAccess: 'We do not have access to your photos. You can grant access in Settings.',
  photoSaved: 'Saved to your photos',

  // Sleep log notification (sleepNotifications)
  sleepNotifChildAwake: 'Baby is awake',
  sleepNotifRunning: 'Sleep log running',
};
