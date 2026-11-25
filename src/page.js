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
              <h3>${escape(item.organization)}</h3>
              <p class="entry-role">${escape(item.role)}</p>
              <p>${escape(item.summary)}</p>
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

  const projects = profile.projects;
  const content = `
    <div class="site">
      <header class="site-header">
        <a class="site-name" href="/">${escape(profile.name)}</a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#teaching">Teaching</a>
          ${link('Résumé', profile.resume)}
        </nav>
      </header>

      <main>
        <section id="about" aria-labelledby="name">
          <h1 id="name">${escape(profile.name)}</h1>
          <p class="affiliation">${escape(profile.role)}<span class="location">${escape(profile.location)}</span></p>
          <div class="introduction">
            <p>${escape(profile.intro)}</p>
            <p>${escape(profile.bio)} ${escape(profile.interests)}</p>
          </div>
          <ul class="contact-links" aria-label="Contact and profiles">
            <li>${link('Email', `mailto:${profile.email}`)}</li>
            <li>${link('GitHub', profile.github)}</li>
            <li>${link('LinkedIn', profile.linkedin)}</li>
            <li>${link('Résumé', profile.resume)}</li>
          </ul>
        </section>

        <section id="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
          <ol class="entry-list">${experience()}
          </ol>
        </section>

        <section id="projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Open source &amp; projects</h2>
          <ul class="project-list">${projects.slice(0, 3).map(project).join('')}
          </ul>
          <details class="more-projects">
            <summary>More projects <span class="project-count">(${projects.length - 3})</span></summary>
            <ul class="project-list">${projects.slice(3).map(project).join('')}
            </ul>
          </details>
        </section>

        <section id="teaching" aria-labelledby="teaching-heading">
          <h2 id="teaching-heading">Teaching &amp; community</h2>
          <ul class="teaching-list">${profile.leadership.map(item => `
            <li>${escape(item)}</li>`).join('')}
          </ul>
        </section>

        <section id="education" aria-labelledby="education-heading">
          <h2 id="education-heading">Education</h2>
          <div class="dated-entry">
            <p class="entry-date">${escape(profile.education.dates)}</p>
            <div>
              <h3>${escape(profile.education.institution)}</h3>
              <p>${escape(profile.education.degree)}</p>
              <p class="entry-role">${escape(profile.education.program)}</p>
            </div>
          </div>
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
