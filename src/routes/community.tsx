import type { MetaFunction } from 'react-router';
import { SectionHead } from '../components/SectionHead';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = ({ location }) =>
  pageMeta(
    'Community — Scaffold',
    'Where Scaffold gets built: GitHub, Discord, Bluesky, and the forum.',
    location.pathname,
  );

export default function CommunityPage() {
  return (
    <main>
      <div className="page-head">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>Community</span>
          </div>
          <h1>
            Built in the <em>open</em>.
          </h1>
          <p className="sub">
            Scaffold is an open protocol, not a company. The spec, the reference implementation,
            and every decision that shaped them are public. Pick a channel.
          </p>
        </div>
      </div>

      <section className="band flush" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="channel-grid">
            <a href="https://github.com/scaffold" target="_blank" rel="noreferrer">
              <div>
                <span className="label">01 · Code</span>
                <h3>GitHub</h3>
                <p>The protocol spec, reference implementation, and issue tracker. Stars welcome; PRs more so.</p>
              </div>
              <span className="arrow">→</span>
            </a>
            <a href="https://discord.gg/scaffold" target="_blank" rel="noreferrer">
              <div>
                <span className="label">02 · Chat</span>
                <h3>Discord</h3>
                <p>Day-to-day development chat, testnet coordination, and a #help channel that actually helps.</p>
              </div>
              <span className="arrow">→</span>
            </a>
            <a href="https://bsky.app/profile/scaffold.io" target="_blank" rel="noreferrer">
              <div>
                <span className="label">03 · Updates</span>
                <h3>Bluesky</h3>
                <p>Release announcements and progress notes. Short-form, low-volume.</p>
              </div>
              <span className="arrow">→</span>
            </a>
            <a href="https://github.com/scaffold/scaffold/discussions" target="_blank" rel="noreferrer">
              <div>
                <span className="label">04 · Long form</span>
                <h3>Forum</h3>
                <p>Protocol design discussions, RFCs, and questions that deserve more than a chat scrollback.</p>
              </div>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="section-inner">
          <SectionHead
            num="§ — Contribute"
            title={<>Good first<br /><em>issues</em>.</>}
            intro="The fastest ways to help before testnet: run the browser demo and file what breaks, review the protocol spec, or pick up an issue tagged good-first-issue on GitHub."
          />
        </div>
      </section>
    </main>
  );
}
