export const profile = {
  name: 'Utku Egemen Umut',
  username: 'utku',
  role: 'Computer science student · machine learning engineer',
  location: 'Toronto, Canada',
  bio: 'ingénieur',
  intro: 'I build machine-learning systems and useful things that make their way out of the research lab and into the real world.',
  education: {
    institution: 'University of Toronto',
    degree: 'Honours Bachelor of Science',
    program: 'Computer Science Specialist · Mathematics Minor',
    dates: 'Sep 2022 – Jun 2027',
    distinction: 'cGPA 3.99 / 4.00 · U of T Scholar · Trinity Scholarships',
    coursework: 'Machine learning, distributed systems, computer vision, parallel & systems programming',
  },
  email: 'egemen.umut@mail.utoronto.ca',
  phone: '+1 (437) 974-0728',
  github: 'https://github.com/umututku03',
  linkedin: 'https://www.linkedin.com/in/utkuegemenumut',
  resume: '/public/resume.pdf',
  experience: [
    {
      role: 'Applied Machine Learning Engineer Intern · PEY',
      organization: 'Cerebras Systems', location: 'Toronto, Canada', dates: 'May 2025 – Aug 2026',
      highlights: [
        'Extended CePO to image and vision-language inputs; added LLM rating and verification tools.',
        'Compared four distillation methods across difficulty-bucketed math and code-generation tasks and authored a white paper on failure modes.',
        'Implemented OPSD and SDPO self-distillation in verl. A per-element forward-KL clipping change raised AIME24 Avg@12 from 48.6 to 53.3.',
        'Integrated SkyRL and GEPA prompt optimization into Applied ML workflows, reporting a 10% improvement over GRPO with 35× fewer rollouts.',
        'Ported the DSA sparse-attention stack to a single 24 GB A10 GPU.',
      ],
    },
    {
      role: 'Software Engineer', organization: 'Knowlecy Technologies', location: 'Toronto, Canada', dates: 'Jan 2025 – Apr 2025',
      highlights: [
        'Built Python and FastAPI services with SQL-backed REST APIs for posts, comments, content discovery, and topic tags.',
        'Developed an event-driven notification service using gRPC and RabbitMQ.',
      ],
    },
    {
      role: 'Computer Vision Researcher · LURA Research Award', organization: 'Computational Vision and Imaging Lab, York University', location: 'Toronto, Canada', dates: 'May 2024 – Aug 2024',
      highlights: [
        'Built a scene-selection pipeline that achieved 91% accuracy across 1,000+ frames of televised footage.',
        'Created camera-motion-robust 2D point tracking to provide context for 3D human pose estimation.',
      ],
    },
    {
      role: 'Undergraduate Researcher', organization: 'Autonomous Vision Group, KUIS AI Research Centre', location: 'Istanbul, Turkey', dates: 'Jun 2023 – Sep 2023',
      highlights: ['Reworked a multi-agent trajectory-prediction pipeline for a Linux HPC cluster, cutting experiment runtime by 30%.'],
    },
    {
      role: 'Machine Learning Engineer Intern', organization: 'TAZI AI Systems', location: 'Istanbul, Turkey', dates: 'May 2023 – Aug 2023',
      highlights: ['Shipped end-to-end churn-prediction models for the Adaptive AutoML platform, achieving 89% accuracy.'],
    },
  ],
  openSource: [
    { name: 'MarkUs', summary: 'Contributed to a Ruby on Rails, React, and PostgreSQL grading platform used by 5,000+ students.', tags: ['Ruby on Rails', 'React', 'PostgreSQL'] },
    { name: 'PythonTA', summary: 'Contributed Python static-analysis tooling used in courses with 5,000+ students annually.', tags: ['Python', 'Pylint', 'Astroid'] },
    { name: 'MemoryViz', summary: 'Helped turn an early prototype into a maintainable learning tool used by thousands.', tags: ['JavaScript', 'Node.js'] },
  ],
  projects: [
    { name: 'MarkUs', url: 'https://github.com/MarkUsProject/Markus', summary: 'Open-source course platform for assignment submissions, rubric-based marking, annotations, and automated grading; I contributed to the codebase.', tags: ['Ruby on Rails', 'React', 'PostgreSQL', 'RSpec'], icon: 'layers' },
    { name: 'PythonTA', url: 'https://github.com/pyta-uoft/pyta', summary: 'Educational Python analyzer combining Pylint, pycodestyle, mypy, and custom AST checks to give beginner-friendly code feedback.', tags: ['Python', 'Static analysis', 'Pylint', 'Astroid', 'mypy'], icon: 'python' },
    { name: 'MemoryViz', url: 'https://github.com/david-yz-liu/memory-viz', summary: 'Creates hand-drawn-style SVG diagrams of Python frames and objects from structured memory data, with a Node.js CLI and browser demos.', tags: ['TypeScript', 'JavaScript', 'Node.js', 'SVG', 'Rough.js'], icon: 'memoryviz' },
    { name: 'Spartan Agent', url: 'https://github.com/umututku03/spartan-agent', summary: 'Ethereum-focused DeFi agent MVP with wallet import and detection, transfers, Uniswap V2 swaps, and Aave V3 supply and borrowing.', tags: ['TypeScript', 'ElizaOS', 'viem', 'Ethereum', 'Uniswap', 'Aave'], icon: 'agent' },
    { name: 'CSC311 ML Challenge Submission', url: 'https://github.com/umututku03/CSC311-ML-Challenge-Submission', summary: 'Inference pipeline for classifying survey-described meals as pizza, shawarma, or sushi, with feature mapping, preprocessing, and extracted neural-network weights.', tags: ['Python', 'PyTorch', 'NumPy', 'Pandas', 'Model inference'], icon: 'model' },
    { name: 'CSC311 ML Challenge', url: 'https://github.com/umututku03/CSC311-ML-Challenge', summary: 'Food-category classification from survey responses; explores feature engineering and compares models for pizza, shawarma, and sushi.', tags: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'Classification'], icon: 'chart' },
    { name: 'CSC309 Scriptorium', url: 'https://github.com/umututku03/CSC309-Scriptorium', summary: 'Collaborative code-sharing platform with editable templates, multi-language execution, user accounts, and a community blog with threaded comments and ratings.', tags: ['Next.js', 'React', 'TypeScript', 'Prisma', 'SQLite', 'Tailwind CSS'], icon: 'web' },
    { name: 'CSC309 Course Project', url: 'https://github.com/umututku03/CSC309-Course-Project', summary: 'Full-stack Scriptorium app: save and fork code templates, run snippets, and publish posts with nested comments, moderation reports, and ratings.', tags: ['Next.js', 'React', 'TypeScript', 'Prisma', 'SQLite', 'Tailwind CSS'], icon: 'browser' },
    { name: 'Music Java App', url: 'https://github.com/umututku03/music-java-app', summary: 'Desktop music-library app for searching Spotify, managing playlists and liked tracks, following artists, and sharing playlists with friends; structured around clean architecture use cases.', tags: ['Java', 'Swing', 'Spotify API', 'Clean Architecture', 'JUnit'], icon: 'music' },
    { name: 'Witnsd', url: 'https://github.com/witnsd/witnsd', summary: 'Cross-platform social app for reacting to current events, sharing takes and predictions, and following community conversations; backed by Supabase and scheduled event-processing functions.', tags: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL', 'Edge Functions'], icon: 'web' },
  ],
  leadership: [
    'Lead Tutorial Teaching Assistant, CSC236 at the University of Toronto · two terms',
    'Machine Learning Projects Director, UTMIST · Sep 2024 – present',
  ],
  skillGroups: [
    { name: 'Languages', items: ['Python', 'C++', 'C', 'SQL', 'Shell', 'Java', 'JavaScript', 'Haskell'] },
    { name: 'Machine learning', items: ['PyTorch', 'FlexAttention', 'Tensor parallelism', 'Distributed training', 'vLLM', 'verl', 'Hugging Face Transformers', 'Inspect', 'scikit-learn'] },
    { name: 'Backend & data', items: ['FastAPI', 'gRPC', 'RabbitMQ', 'PostgreSQL'] },
    { name: 'Systems & tools', items: ['Linux', 'Docker', 'Slurm / HPC', 'GPU programming', 'Git', 'CI / CD'] },
  ],
  skills: [],
};
