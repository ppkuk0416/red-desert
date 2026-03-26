import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'ko' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`@red-desert/i18n/messages/${locale}.json`)).default,
  }
})
