import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import settings from './site-settings.json';

const config: Config = {
  ...settings,
  title: 'Test Portal',
  tagline: 'Unified Test Reporting and Analytics',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [['classic', {
    docs: {
      sidebarPath: './sidebars.ts',
      editUrl: 'https://github.com/VENTIONINC/TestPortal-documentation/edit/main/',
    },
    blog: false,
    theme: {customCss: './src/css/custom.css'},
    sitemap: {changefreq: 'weekly', priority: 0.5},
  } satisfies Preset.Options]],
  themes: [['@easyops-cn/docusaurus-search-local', {
    hashed: true,
    language: ['en'],
    indexDocs: true,
    indexBlog: false,
    indexPages: true,
    highlightSearchTermsOnTargetPage: true,
  }]],
  themeConfig: {
    colorMode: {defaultMode: 'light', respectPrefersColorScheme: true},
    navbar: {
      title: 'Test Portal',
      items: [
        {to: '/docs/getting-started', label: 'Getting Started', position: 'left'},
        {to: '/docs/guides', label: 'User Guides', position: 'left'},
        {to: '/docs/integrations', label: 'Integrations', position: 'left'},
        {to: '/docs/cli', label: 'CLI', position: 'left'},
        {to: '/docs/api', label: 'API', position: 'left'},
        {to: '/docs/mcp', label: 'MCP', position: 'left'},
        {href: 'https://github.com/VENTIONINC/TestPortal-documentation', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [{title: 'Test Portal', items: [
        {label: 'Overview', to: '/docs/intro'},
        {label: 'GitHub', href: 'https://github.com/VENTIONINC/TestPortal-documentation'},
      ]}],
      copyright: 'Test Portal · Apache License 2.0',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};
export default config;
