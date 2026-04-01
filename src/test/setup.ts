import "@testing-library/jest-dom"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enCommon from "../i18n/locales/en/common.json"
import enPatients from "../i18n/locales/en/patients.json"
import enMeasurements from "../i18n/locales/en/measurements.json"
import enAuth from "../i18n/locales/en/auth.json"

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["common", "patients", "measurements", "auth"],
  defaultNS: "common",
  resources: {
    en: {
      common: enCommon,
      patients: enPatients,
      measurements: enMeasurements,
      auth: enAuth,
    },
  },
  interpolation: { escapeValue: false },
})
