const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
   mobileMenu.classList.toggle('hidden');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
   anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
         target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
         });
         mobileMenu.classList.add('hidden');
      }
   });
});

// Scroll Animation Observer
const observerOptions = {
   threshold: 0.1,
   rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
      if (entry.isIntersecting) {
         entry.target.classList.add('visible');
      }
   });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Mouse Parallax for Hero Grid
const gridBg = document.getElementById("grid-bg");

window.addEventListener("mousemove", (event) => {
   const x = event.clientX - window.innerWidth / 2;
   const y = event.clientY - window.innerHeight / 2;
   gridBg.style.transform = `translate(${x / 30}px, ${y / 30}px)`;
});

// GitHub API Integration
const GITHUB_ORG = 'BengalEmpire';
const GITHUB_API = 'https://api.github.com';

// Fetch Organization Stats
async function fetchOrgStats() {
   try {
      const orgResponse = await fetch(`${GITHUB_API}/orgs/${GITHUB_ORG}`);
      const orgData = await orgResponse.json();

      const reposResponse = await fetch(`${GITHUB_API}/orgs/${GITHUB_ORG}/repos?per_page=100`);
      const repos = await reposResponse.json();

      if (Array.isArray(repos)) {
         const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
         const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
         const totalIssues = repos.reduce((sum, repo) => sum + repo.open_issues_count, 0);

         const contributors = Array.isArray(orgData.public_members) ? orgData.public_members.length : 0;

         displayStats({
            repos: repos.length,
            stars: totalStars,
            forks: totalForks,
            contributors: contributors
         });

         displayRepos(repos.slice(0, 6));
         createLanguageChart(repos);
      } else {
         displayStats({
            repos: 0,
            stars: 0,
            forks: 0,
            contributors: 0
         });
         displayRepos([]);
      }
   } catch (error) {
      console.error('Error fetching GitHub data:', error);
      document.getElementById('stats-container').innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                        <p>Unable to load GitHub stats. Please check back later.</p>
                    </div>
                `;
      document.getElementById('repos-container').innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                        <p>Unable to load repositories. Please visit our <a href="https://github.com/${GITHUB_ORG}" class="text-orange-500 hover:underline">GitHub page</a>.</p>
                    </div>
                `;
   }
}

// Display Stats
function displayStats(stats) {
   const statsContainer = document.getElementById('stats-container');
   statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${stats.repos.toLocaleString()}</div>
                    <p class="text-gray-400 mt-2">Repositories</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.stars.toLocaleString()}</div>
                    <p class="text-gray-400 mt-2">Total Stars</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.forks.toLocaleString()}</div>
                    <p class="text-gray-400 mt-2">Total Forks</p>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.contributors.toLocaleString()}</div>
                    <p class="text-gray-400 mt-2">Contributors</p>
                </div>
            `;
}

// Display Repositories
function displayRepos(repos) {
   const reposContainer = document.getElementById('repos-container');
   if (repos.length === 0) {
      reposContainer.innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        <i class="fas fa-folder-open text-6xl mb-4 opacity-50"></i>
                        <p>No repositories found. <a href="https://github.com/${GITHUB_ORG}" class="text-orange-500 hover:underline">Visit GitHub</a></p>
                    </div>
                `;
      return;
   }

   reposContainer.innerHTML = repos.map(repo => `
                <div class="card repo-card fade-in" onclick="window.open('https://github.com/${GITHUB_ORG}/${repo.name}', '_blank')">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-folder text-2xl mr-3" style="color: var(--bengal-orange);"></i>
                        <h3 class="text-xl font-bold flex-1">${repo.name}</h3>
                        <div class="text-sm text-gray-400">
                            <i class="fab fa-github mr-1"></i>
                            <a href="https://github.com/${GITHUB_ORG}/${repo.name}" target="_blank" class="hover:text-orange-500">View</a>
                        </div>
                    </div>
                    ${repo.description ? `<p class="text-gray-400 mb-4">${repo.description}</p>` : ''}
                    <div class="flex flex-wrap gap-4 text-sm">
                        ${repo.language ? `
                            <span class="inline-flex items-center bg-gray-800 px-2 py-1 rounded-full">
                                <div class="w-2 h-2 rounded-full mr-2" style="background-color: ${getLanguageColor(repo.language)};"></div>
                                ${repo.language}
                            </span>
                        ` : ''}
                        <span class="inline-flex items-center text-gray-400">
                            <i class="fas fa-star mr-1"></i> ${repo.stargazers_count}
                        </span>
                        <span class="inline-flex items-center text-gray-400">
                            <i class="fas fa-code-branch mr-1"></i> ${repo.forks_count}
                        </span>
                        ${repo.open_issues_count > 0 ? `
                            <span class="inline-flex items-center text-gray-400">
                                <i class="fas fa-issue-opened mr-1"></i> ${repo.open_issues_count}
                            </span>
                        ` : ''}
                    </div>
                </div>
            `).join('');

   // Re-observe new fade-in elements
   document.querySelectorAll('.repo-card').forEach(el => observer.observe(el));
}

// Get language color
function getLanguageColor(language) {
   const colors = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3776ab',
      'Java': '#007396',
      'C++': '#f34b7d',
      'Go': '#00add8',
      'Rust': '#dea584',
      'HTML': '#e34f26',
      'CSS': '#1572b6',
      'Shell': '#89e051'
   };
   return colors[language] || '#6c757d';
}

// Create Language Chart
function createLanguageChart(repos) {
   const ctx = document.getElementById('languageChart').getContext('2d');

   // Aggregate languages
   const languageCounts = repos.reduce((acc, repo) => {
      if (repo.language) {
         acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
   }, {});

   const labels = Object.keys(languageCounts);
   const data = Object.values(languageCounts);

   if (labels.length === 0) {
      ctx.canvas.style.display = 'none';
      return;
   }

   // Colors for chart (theme-friendly)
   const colors = [
      'rgba(245, 124, 0, 0.8)',
      'rgba(25, 118, 210, 0.8)',
      'rgba(67, 160, 71, 0.8)',
      'rgba(255, 152, 0, 0.8)',
      'rgba(21, 101, 192, 0.8)',
      'rgba(46, 125, 50, 0.8)',
      'rgba(233, 30, 99, 0.8)',
      'rgba(156, 39, 176, 0.8)',
      'rgba(0, 188, 212, 0.8)',
      'rgba(255, 193, 7, 0.8)'
   ];

   new Chart(ctx, {
      type: 'doughnut',
      data: {
         labels: labels,
         datasets: [{
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 2,
            hoverOffset: 10
         }]
      },
      options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
            legend: {
               position: 'bottom',
               labels: {
                  color: '#f5f5f5',
                  padding: 20,
                  usePointStyle: true
               }
            }
         },
         animation: {
            animateRotate: true,
            duration: 1500
         }
      }
   });
}

// Initialize on load
window.addEventListener('load', fetchOrgStats);

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
   const question = item.querySelector('.faq-question');
   const answer = item.querySelector('.faq-answer');
   const plus = item.querySelector('.plus');

   question.addEventListener('click', () => {
      const isOpen = answer.classList.contains('open');

      // Close all other answers
      document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
      document.querySelectorAll('.plus').forEach(p => p.classList.remove('rotate'));

      if (!isOpen) {
         answer.classList.add('open');
         plus.classList.add('rotate');
      }
   });
});