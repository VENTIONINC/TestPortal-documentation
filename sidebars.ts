import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const category = (label: string, id: string, items: string[]) => ({
  type: 'category' as const,
  label,
  className: 'sidebar-category-hierarchy',
  link: {type: 'doc' as const, id},
  collapsed: false,
  items,
});

const sidebars: SidebarsConfig = {
  documentation: [
    'intro',
    category('Getting Started', 'getting-started/index', [
      'getting-started/quickstart',
      'getting-started/authentication',
      'getting-started/first-report',
    ]),
    category('User Guides', 'guides/index', [
      'guides/test-executions',
      'guides/test-results',
      'guides/issues',
    ]),
    category('Integrations', 'integrations/index', [
      'integrations/playwright',
      'integrations/jest',
      'integrations/cypress',
      'integrations/github-actions',
    ]),
    category('CLI', 'cli/index', [
      'cli/installation',
      'cli/configuration',
      'cli/commands',
    ]),
    category('API', 'api/index', [
      'api/authentication',
      'api/report-upload',
    ]),
    category('MCP', 'mcp/index', [
      'mcp/getting-started',
      'mcp/tools',
    ]),
    'troubleshooting',
  ],
};
export default sidebars;
