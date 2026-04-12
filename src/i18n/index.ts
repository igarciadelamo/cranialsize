import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import enCommon from "./locales/en/common.json"
import enPatients from "./locales/en/patients.json"
import enMeasurements from "./locales/en/measurements.json"
import enAuth from "./locales/en/auth.json"

import esCommon from "./locales/es/common.json"
import esPatients from "./locales/es/patients.json"
import esMeasurements from "./locales/es/measurements.json"
import esAuth from "./locales/es/auth.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        patients: enPatients,
        measurements: enMeasurements,
        auth: enAuth,
      },
      es: {
        common: esCommon,
        patients: esPatients,
        measurements: esMeasurements,
        auth: esAuth,
      },
    },
    fallbackLng: "es",
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "cranialsize-lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
