import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Amplify Accounting",
  version: packageJson.version,
  copyright: `© ${currentYear}, Amplify Accounting.`,
  meta: {
    title: "Amplify Accounting - Modern Accounting Solution",
    description:
      "Amplify Accounting is a modern, cloud-based accounting solution designed to streamline your financial management processes.",
  },
};
