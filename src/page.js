import { profile } from './profile.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const link = (label, url) => `<a href="${escape(url)}">${escape(label)}</a>`;

function experience() {
  return profile.experience.map(item => `
          <li class="dated-entry">
            <p class="entry-date">${escape(item.dates)}</p>
            <div>
              <h3>${escape(item.role)} · ${item.url ? link(item.organization, item.url) : escape(item.organization)}</h3>
              ${item.location ? `<p class="entry-role">${escape(item.location)}</p>` : ''}
              ${item.summary ? `<p>${escape(item.summary)}</p>` : ''}
            </div>
          </li>`).join('');
}

function project(item) {
  return `
          <li class="project">
            <h3>${link(item.name, item.url)}</h3>
            <p>${escape(item.summary)}</p>
            ${item.repoLinks?.length > 1 ? `<p class="repo-links">${item.repoLinks.map(repo => link(repo.label, repo.url)).join('<span aria-hidden="true"> / </span>')}</p>` : ''}
          </li>`;
}

export function renderPage(template) {
  if (!template.includes('<!-- PAGE_CONTENT -->')) {
    throw new Error('The homepage template is missing its content marker.');
  }

  const projects = profile.projects.filter(item => !profile.openSource.some(contribution => contribution.name === item.name));
  const content = `
    <div class="site">
      <header class="site-header">
        <a class="site-name" href="/">${escape(profile.name)}</a>
        <nav aria-label="Main navigation">
          <a href="#readme">README</a>
          <a href="#news">News</a>
          <a href="#blog">Blog</a>
          ${link('Résumé', profile.resume)}
        </nav>
      </header>

      <main>
        <div class="profile-header">
          <div>
            <h1 id="name">${escape(profile.name)}</h1>
            <p class="affiliation">${escape(profile.role)}</p>
            <ul class="contact-links" aria-label="Contact and profiles">
              <li>${link('Email', `mailto:${profile.email}`)}</li>
              <li>${link('GitHub', profile.github)}</li>
              <li>${link('LinkedIn', profile.linkedin)}</li>
              <li>${link('Résumé', profile.resume)}</li>
            </ul>
          </div>
          <img class="profile-photo" src="${escape(profile.photo)}" alt="${escape(profile.name)} presenting a research poster" width="160" height="160" fetchpriority="high" />
        </div>

        <section id="readme" aria-labelledby="readme-heading">
          <h2 id="readme-heading">README</h2>
          <p>${escape(profile.intro)}</p>
          <p class="readme-source">${link('Original README', '/public/profile-readme.md')}</p>
        </section>

        <section id="news" aria-labelledby="news-heading">
          <h2 id="news-heading">News</h2>
          <ol class="entry-list news-list">${profile.news.map(item => `
            <li class="dated-entry"><p class="entry-date">${escape(item.date)}</p><p>${escape(item.text)}</p></li>`).join('')}
          </ol>
        </section>

        <section id="blog" aria-labelledby="blog-heading">
          <h2 id="blog-heading">Blog</h2>
          ${profile.posts.length ? `<ul class="project-list">${profile.posts.map(project).join('')}</ul>` : '<p class="empty-note">No posts published yet.</p>'}
        </section>

        <section id="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
          <ol class="entry-list">${experience()}
          </ol>
        </section>

        <section id="open-source" aria-labelledby="open-source-heading">
          <h2 id="open-source-heading">Open source</h2>
          <ul class="contribution-list"><li><strong>${link(profile.openSource[0].name, profile.openSource[0].url)}</strong> — ${escape(profile.openSource[0].summary)} ${link('Pull requests', profile.openSource[0].pullRequests)}</li></ul>
          <p class="sds-context">Through ${link('Students Developing Software (SDS)', 'https://www.cs.toronto.edu/~david/')} (2023–2024), I contributed to tools used in University of Toronto courses:</p>
          <ul class="contribution-list">${profile.openSource.slice(1).map(item => `
            <li><strong>${link(item.name, item.url)}</strong> — ${escape(item.summary)} ${link('Pull requests', item.pullRequests)}</li>`).join('')}
          </ul>
          <details class="more-projects">
            <summary>Other projects <span class="project-count">(${projects.length})</span></summary>
            <ul class="project-list">${projects.map(project).join('')}
            </ul>
          </details>
        </section>

        <section id="teaching" aria-labelledby="teaching-heading">
          <h2 id="teaching-heading">Teaching and leadership</h2>
          <ul class="teaching-list">${profile.leadership.map(item => `
            <li><strong>${escape(item.role)}</strong> — ${escape(item.description)}</li>`).join('')}
          </ul>
        </section>

        <section id="tools" aria-labelledby="tools-heading">
          <h2 id="tools-heading">Languages and tools</h2>
          <div class="tools-list">${profile.skillGroups.map(group => `
            <p><strong>${escape(group.name)}:</strong> ${escape(group.items.join(', '))}</p>`).join('')}
          </div>
          <details class="activity">
            <summary>GitHub activity</summary>
            <img src="/public/github-metrics.svg" alt="GitHub activity and language statistics" loading="lazy" />
          </details>
        </section>
      </main>

      <footer>
        <span>${escape(profile.name)}</span>
        <span>Last updated November 2026 · ${link('Source', `${profile.github}/umututku03.github.io`)}</span>
      </footer>
    </div>`;

  return template
    .replace('{{name}}', () => escape(profile.name))
    .replace('{{description}}', () => escape(`${profile.name}. ${profile.role}. Machine learning, language models, and computer vision.`))
    .replace('<!-- PAGE_CONTENT -->', () => content);
}
