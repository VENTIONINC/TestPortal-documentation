import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const sections = [
  ['Getting Started', 'Identify the instance, project, and credentials you need.', '/docs/getting-started'],
  ['User Guides', 'Explore executions, test results, and linked issues.', '/docs/guides'],
  ['Integrations', 'Choose a report format for your testing framework.', '/docs/integrations'],
  ['CLI', 'Convert framework reports and submit them to Test Portal.', '/docs/cli'],
  ['API', 'Understand report uploads and integration credentials.', '/docs/api'],
  ['MCP', 'Connect an MCP client to explore your test data.', '/docs/mcp'],
];

export default function Home(): ReactNode {
  return (
    <Layout title="Unified Test Reporting and Analytics" description="Bring test reports together, inspect results, and investigate issues with Test Portal.">
      <header className="hero portal-hero">
        <div className="container">
          <p className="portal-eyebrow">Test Portal documentation</p>
          <h1>Turn test reports into a clearer picture.</h1>
          <p className="hero__subtitle">Bring test runs together. Explore results. Investigate failures.</p>
          <div className="portal-actions">
            <Link className="button button--primary button--lg" to="/docs/getting-started/first-report">Upload your first report</Link>
            <Link className="button button--secondary button--lg" to="/docs/intro">Explore Test Portal</Link>
          </div>
        </div>
      </header>
      <main className="container margin-vert--xl">
        <h2>Find your next step</h2>
        <div className="portal-grid">
          {sections.map(([title, description, to]) => (
            <article className="card padding--lg" key={to}>
              <h3><Link to={to}>{title}</Link></h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </main>
    </Layout>
  );
}
