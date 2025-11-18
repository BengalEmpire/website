 // Initialize AOS with performance settings
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
      disable: window.innerWidth < 768 ? 'mobile' : false
    });
    // Enhanced Video Control with Audio Fade
    const video = document.getElementById('scrollVideo');
    const videoSection = document.querySelector('#video');
    const muteBtn = document.getElementById('muteToggle');
    let played = false;
    let currentVolume = 0;
    let targetVolume = 0;
    let audioAnimationFrame = null;
    // Smooth audio fade function
    function smoothAudioTransition() {
      const difference = targetVolume - currentVolume;
      const step = difference * 0.05; // Smooth transition speed
     
      if (Math.abs(difference) > 0.01) {
        currentVolume += step;
        video.volume = Math.max(0, Math.min(1, currentVolume));
        audioAnimationFrame = requestAnimationFrame(smoothAudioTransition);
      } else {
        currentVolume = targetVolume;
        video.volume = currentVolume;
      }
    }
    // Intersection Observer for video
    const observerOptions = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '0px'
    };
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio;
       
        if (entry.isIntersecting) {
          if (!played) {
            video.play().catch(e => console.log('Autoplay prevented:', e));
            played = true;
            videoSection.classList.add('active');
          }
         
          // Fade in audio based on scroll position
          if (!video.muted) {
            targetVolume = Math.min(ratio * 1.2, 0.7); // Max 70% volume
            if (!audioAnimationFrame) {
              smoothAudioTransition();
            }
          }
        } else {
          // Fade out audio when leaving viewport
          targetVolume = 0;
          if (!audioAnimationFrame) {
            smoothAudioTransition();
          }
        }
      });
    }, observerOptions);
    videoObserver.observe(videoSection);
    // Mute toggle with smooth transition
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      const icon = muteBtn.querySelector('i');
      const text = muteBtn.querySelector('span');
     
      if (video.muted) {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'Unmute';
        targetVolume = 0;
      } else {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'Mute';
        const rect = videoSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleRatio = Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));
        targetVolume = Math.min(visibleRatio * 1.2, 0.7);
      }
     
      smoothAudioTransition();
    });
    // Mobile menu toggle with smooth animation
    const mobileBtn = document.getElementById('mobileBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;
    mobileBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      const icon = mobileBtn.querySelector('i');
     
      if (menuOpen) {
        mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
        icon.className = 'fas fa-times';
        mobileBtn.style.transform = 'rotate(90deg)';
      } else {
        mobileMenu.style.maxHeight = '0';
        icon.className = 'fas fa-bars';
        mobileBtn.style.transform = 'rotate(0deg)';
      }
    });
    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuOpen) {
          mobileMenu.style.maxHeight = '0';
          mobileBtn.querySelector('i').className = 'fas fa-bars';
          mobileBtn.style.transform = 'rotate(0deg)';
          menuOpen = false;
        }
      });
    });
    // Navbar scroll effect
    let lastScroll = 0;
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
     
      if (currentScroll > 100) {
        nav.style.padding = '0.5rem 0';
        nav.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      } else {
        nav.style.padding = '0.75rem 0 sm:1.25rem 0';
        nav.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      }
     
      lastScroll = currentScroll;
    }, { passive: true });
    // GitHub Data with Enhanced Error Handling
    const ORG = 'BengalEmpire';
    let dataLoaded = false;
    async function loadOrgData() {
      try {
        const [org, reposRes, membersRes] = await Promise.all([
          fetch(`https://api.github.com/orgs/${ORG}`).then(r => { if (!r.ok) throw new Error('Failed to fetch org'); return r.json(); }),
          fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=stars`).then(r => { if (!r.ok) throw new Error('Failed to fetch repos'); return r.json(); }),
          fetch(`https://api.github.com/orgs/${ORG}/public_members?per_page=100`).then(r => { if (!r.ok) throw new Error('Failed to fetch members'); return r.json(); })
        ]);
        // Hide loader and show bio
        const bioContainer = document.getElementById('orgBioContainer');
        const bioElement = document.getElementById('orgBio');
        bioContainer.style.display = 'none';
        bioElement.innerHTML = org.description || "A fearless open-source collective reviving Bengal's golden age through code.";
        bioElement.style.opacity = '1';
        // Calculate stats
        const stats = {
          repos: reposRes.length,
          stars: reposRes.reduce((a,r) => a + r.stargazers_count, 0),
          forks: reposRes.reduce((a,r) => a + r.forks_count, 0),
          members: membersRes.length,
          topRepos: reposRes.sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0, 9)
        };
        // Animated counter function
        function animateCounter(element, target, duration = 2000) {
          const start = 0;
          const startTime = performance.now();
         
          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const current = Math.floor(start + (target - start) * easeProgress);
            element.textContent = current.toLocaleString();
           
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              element.textContent = target.toLocaleString();
            }
          }
          requestAnimationFrame(updateCounter);
        }
        // Render stats with animation
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
          <div data-aos="flip-up"><div class="stat-number">0</div><p class="text-xl sm:text-2xl text-gray-400 mt-3 sm:mt-4">Repositories</p></div>
          <div data-aos="flip-up" data-aos-delay="200"><div class="stat-number">0</div><p class="text-xl sm:text-2xl text-gray-400 mt-3 sm:mt-4">Stars</p></div>
          <div data-aos="flip-up" data-aos-delay="400"><div class="stat-number">0</div><p class="text-xl sm:text-2xl text-gray-400 mt-3 sm:mt-4">Forks</p></div>
          <div data-aos="flip-up" data-aos-delay="600"><div class="stat-number">0</div><p class="text-xl sm:text-2xl text-gray-400 mt-3 sm:mt-4">Warriors</p></div>
        `;
        const counterElements = statsGrid.querySelectorAll('.stat-number');
        animateCounter(counterElements[0], stats.repos);
        animateCounter(counterElements[1], stats.stars);
        animateCounter(counterElements[2], stats.forks);
        animateCounter(counterElements[3], stats.members);
        // Render projects
        document.getElementById('repos').innerHTML = stats.topRepos.map((r, i) => `
          <a href="${r.html_url}" target="_blank" class="card group" data-aos="fade-up" data-aos-delay="${i * 100}">
            <h3 class="text-2xl sm:text-3xl font-bold group-hover:text-bengal transition">${r.name}</h3>
            <p class="text-gray-400 my-4 sm:my-6 text-base sm:text-lg">${r.description || 'No description'}</p>
            <div class="flex gap-4 sm:gap-6 text-base sm:text-lg">
              ${r.language ? `<span class="px-3 sm:px-4 py-1 sm:py-2 bg-gray-800 rounded-full">${r.language}</span>` : ''}
              <span>⭐ ${r.stargazers_count}</span>
              <span>⑂ ${r.forks_count}</span>
            </div>
          </a>
        `).join('');
        // Render members
        const membersGrid = document.getElementById('membersGrid');
        membersGrid.innerHTML = membersRes.length > 0 ? membersRes.map((m, i) => `
          <a href="${m.html_url}" target="_blank" class="card group text-center" data-aos="fade-up" data-aos-delay="${i * 100}">
            <img src="${m.avatar_url}" alt="${m.login}" class="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 ring-4 ring-bengal/60 group-hover:ring-bengal transition" />
            <h3 class="text-xl sm:text-2xl font-bold group-hover:text-bengal transition">${m.login}</h3>
          </a>
        `).join('') : '<p class="col-span-full text-gray-400 text-center">No public members yet. Join us!</p>';
        // Language Chart
        const langCount = {};
        reposRes.forEach(r => {
          if (r.language) {
            langCount[r.language] = (langCount[r.language] || 0) + 1;
          }
        });
        if (typeof Chart !== 'undefined' && Object.keys(langCount).length > 0) {
          new Chart(document.getElementById('langChart'), {
            type: 'doughnut',
            data: {
              labels: Object.keys(langCount),
              datasets: [{
                data: Object.values(langCount),
                backgroundColor: ['#f57c00','#1976d2','#43a047','#e91e63','#00bcd4','#ff9800','#9c27b0']
              }]
            },
            options: {
              plugins: {
                legend: {
                  labels: {
                    color: '#fff',
                    font: { size: 14, sm:16 }
                  }
                }
              },
              responsive: true,
              maintainAspectRatio: false
            }
          });
        } else {
          document.getElementById('langChart').parentNode.innerHTML = '<p class="text-red-500">Failed to load chart. Please check console for errors.</p>';
        }
      } catch (e) {
        console.error("Error in loadOrgData:", e);
        // Show error messages
        document.getElementById('orgBioContainer').innerHTML = '<p class="text-red-500">Failed to load organization info. Please try again later.</p>';
        document.getElementById('statsGrid').innerHTML = '<p class="col-span-full text-red-500">Failed to load stats.</p>';
        document.getElementById('repos').innerHTML = '<p class="col-span-full text-red-500">Failed to load projects.</p>';
        document.getElementById('membersGrid').innerHTML = '<p class="col-span-full text-red-500">Failed to load members.</p>';
      }
    }
    window.addEventListener('load', loadOrgData);