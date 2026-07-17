const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean DB
  await prisma.reviewComment.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sera.com',
      password: passwordHash,
      name: 'Aravind Nair',
      role: 'ADMIN',
      title: 'Editor-in-Chief',
      bio: 'Aravind has spent over two decades in investigative journalism and editorial leadership.',
      headshot: '/images/authors/aravind.jpg',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@sera.com',
      password: passwordHash,
      name: 'Devika Roy',
      role: 'EDITOR',
      title: 'Managing Editor',
      bio: 'Devika oversees the daily editorial workflows and focuses on culture, business, and policy rails.',
      headshot: '/images/authors/devika.jpg',
    },
  });

  const author1 = await prisma.user.create({
    data: {
      email: 'author@sera.com',
      password: passwordHash,
      name: 'Ananya Reddy',
      role: 'AUTHOR',
      title: 'Senior Correspondent',
      bio: 'Ananya reports on global supply chains, international trade policy, and environmental infrastructure.',
      headshot: '/images/authors/ananya.jpg',
    },
  });

  const author2 = await prisma.user.create({
    data: {
      email: 'karan@sera.com',
      password: passwordHash,
      name: 'Karan Mehta',
      role: 'AUTHOR',
      title: 'Technology Writer',
      bio: 'Karan covers hardware infrastructure, high-performance computing, and digital energy footprints.',
      headshot: '/images/authors/karan.jpg',
    },
  });

  // Additional authors for sample content metadata
  const authorRohan = await prisma.user.create({
    data: {
      email: 'rohan@sera.com',
      password: passwordHash,
      name: 'Rohan Vaidya',
      role: 'AUTHOR',
      title: 'Contributing Essayist',
      bio: 'Rohan writes at the intersection of psychology, speed, and modern workflow design.',
    },
  });

  const authorMeera = await prisma.user.create({
    data: {
      email: 'meera@sera.com',
      password: passwordHash,
      name: 'Meera Kapoor',
      role: 'AUTHOR',
      title: 'Urban Policy Fellow',
      bio: 'Meera researches workplace layout, remote logistics, and real estate urbanism.',
    },
  });

  const authorChandran = await prisma.user.create({
    data: {
      email: 'chandran@sera.com',
      password: passwordHash,
      name: 'S. Chandran',
      role: 'AUTHOR',
      title: 'Reader-in-Residence',
      bio: 'Chandran writes on literary histories and the longevity of the physical and digital printed word.',
    },
  });

  const authorImran = await prisma.user.create({
    data: {
      email: 'imran@sera.com',
      password: passwordHash,
      name: 'Imran Sheikh',
      role: 'AUTHOR',
      title: 'Global Politics Editor',
      bio: 'Imran details state policies, electoral layouts, and geopolitical friction.',
    },
  });

  const authorNaina = await prisma.user.create({
    data: {
      email: 'naina@sera.com',
      password: passwordHash,
      name: 'Naina Bhatt',
      role: 'AUTHOR',
      title: 'National Bureau Chief',
      bio: 'Naina tracks federal ministries, budget allocations, and national security.',
    },
  });

  console.log('Users created.');

  // 2. Create Categories
  const categories = [
    { name: 'World', slug: 'world', displayOrder: 1, description: 'International news, geopolitics, and global trends.' },
    { name: 'India', slug: 'india', displayOrder: 2, description: 'National news, regional reports, and local dynamics.' },
    { name: 'Business', slug: 'business', displayOrder: 3, description: 'Corporate shifts, supply chain economics, and financial systems.' },
    { name: 'Technology', slug: 'technology', displayOrder: 4, description: 'Computing infrastructure, silicon hardware, and software systems.' },
    { name: 'Politics', slug: 'politics', displayOrder: 5, description: 'Policy updates, election tracking, and administrative briefs.' },
    { name: 'Culture', slug: 'culture', displayOrder: 6, description: 'Fine arts, culinary essays, literature reviews, and societal shifts.' },
    { name: 'Opinion', slug: 'opinion', displayOrder: 7, description: 'Longform commentary, editorial columns, and philosophical reviews.' },
    { name: 'Entertainment', slug: 'entertainment', displayOrder: 8, description: 'Cinema profiles, digital theater review, and cultural events.' },
    { name: 'Lifestyle', slug: 'lifestyle', displayOrder: 9, description: 'Analog spaces, minimalistic design, and intentional living.' },
    { name: 'Celebrity', slug: 'celebrity', displayOrder: 10, description: 'Profiles of public figures, editorial interviews, and verified briefs.' },
  ];

  const dbCategories = {};
  for (const cat of categories) {
    dbCategories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }
  console.log('Categories created.');

  // 3. Create Tags
  const tags = ['Infrastructure', 'Supply Chains', 'Computing', 'Analog', 'Federal Budget', 'Geopolitics', 'Workplace', 'Literature', 'Slow Living'];
  const dbTags = {};
  for (const tagName of tags) {
    dbTags[tagName] = await prisma.tag.create({
      data: { name: tagName, slug: tagName.toLowerCase().replace(' ', '-') },
    });
  }
  console.log('Tags created.');

  // 4. Create Articles (approx. 10 matching mockup content + workflow test cases)
  const sampleArticles = [
    {
      title: "Inside the quiet race to control the world's cooling supply chains",
      slug: "quiet-race-control-worlds-cooling-supply-chains",
      deck: "As heat becomes infrastructure policy, a handful of firms are deciding who stays comfortable — and who doesn't.",
      body: `<p class="first">Every conversation about the limits of computing eventually turns to power — how much of it exists, and who gets to use it. But the more immediate ceiling isn't generation. It's heat, and where it goes once the machines are done with it.</p>
<p>Data-center operators have spent a decade optimizing for density, packing more computation into less floor space. That strategy is now colliding with a simpler constraint: there are only so many ways to move heat out of a building fast enough, and most of them depend on water, land, or a power grid that is already stretched thin.</p>
<div class="pull">"We didn't run out of electricity. We ran out of places to put the heat."</div>
<p>In interviews across four countries, engineers described a quiet reordering of priorities — where a site's proximity to a river or coastline now matters more than its proximity to fiber. The industry that once measured itself in teraflops is starting to measure itself in litres per second.</p>
<p>What happens next depends less on any single breakthrough than on a series of unglamorous decisions: permitting timelines, water rights, and which cities are willing to trade comfort for capacity. None of it makes for a good keynote slide. All of it will decide who builds what, and where.</p>`,
      categoryId: dbCategories['world'].id,
      heroImage: 'https://picsum.photos/id/1048/1400/900',
      caption: 'A distribution warehouse managing climate supply routes through the logistics hub.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 11,
      publishDate: new Date('2026-07-17T10:00:00.000Z'),
      authors: { connect: [{ id: author1.id }] },
      tags: { connect: [{ id: dbTags['Supply Chains'].id }, { id: dbTags['Infrastructure'].id }] },
    },
    {
      title: "The chips are fine. It's the cooling that will break first",
      slug: "chips-fine-cooling-breaks-first",
      deck: "Every conversation about the limits of computing eventually turns to power — how much of it exists, and who gets to use it. But the more immediate ceiling is heat.",
      body: `<p class="first">Every conversation about the limits of computing eventually turns to power — how much of it exists, and who gets to use it. But the more immediate ceiling isn't generation. It's heat, and where it goes once the machines are done with it.</p>
<p>Data-center operators have spent a decade optimizing for density, packing more computation into less floor space. That strategy is now colliding with a simpler constraint: there are only so many ways to move heat out of a building fast enough, and most of them depend on water, land, or a power grid that is already stretched thin.</p>
<div class="pull">"We didn't run out of electricity. We ran out of places to put the heat."</div>
<p>In interviews across four countries, engineers described a quiet reordering of priorities — where a site's proximity to a river or coastline now matters more than its proximity to fiber. The industry that once measured itself in teraflops is starting to measure itself in litres per second.</p>
<p>What happens next depends less on any single breakthrough than on a series of unglamorous decisions: permitting timelines, water rights, and which cities are willing to trade comfort for capacity. None of it makes for a good keynote slide. All of it will decide who builds what, and where.</p>`,
      categoryId: dbCategories['technology'].id,
      heroImage: 'https://picsum.photos/id/1050/1200/700',
      caption: 'A liquid-cooling facility outside Pune, running at full capacity through the summer months.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 9,
      publishDate: new Date('2026-07-17T09:30:00.000Z'),
      authors: { connect: [{ id: author2.id }] },
      tags: { connect: [{ id: dbTags['Computing'].id }, { id: dbTags['Infrastructure'].id }] },
    },
    {
      title: "The founders quietly building companies without headquarters, or headcount",
      slug: "founders-quietly-building-without-headquarters",
      deck: "A new generation is choosing thin teams and thick margins — and rewriting what \"scale\" means in the process.",
      body: `<p class="first">A new dynamic is taking root in high-margin software and manufacturing sectors. Smaller entities, staffed by a core of two or three partners, are coordinating vast arrays of subcontractors, automated agents, and API integrations.</p>
<p>By bypassing standard capital cycles and refusing traditional hiring rules, these founders bypass organizational overhead. They measure scale not by office footprint or staff headcount, but by profit margin per coordinator.</p>
<p>The result is a hyper-lean footprint that remains incredibly agile, shifting its reliance on software providers and specialized agencies as market needs pivot.</p>`,
      categoryId: dbCategories['business'].id,
      heroImage: 'https://picsum.photos/id/1074/900/560',
      caption: 'Collaborators interacting in an open studio space.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 8,
      publishDate: new Date('2026-07-16T14:00:00.000Z'),
      authors: { connect: [{ id: editor.id }] },
      tags: { connect: [{ id: dbTags['Supply Chains'].id }] },
    },
    {
      // Opinion 1
      title: "We keep mistaking speed for progress",
      slug: "mistaking-speed-for-progress",
      deck: "The acceleration of release cycles has given us more things, faster. It hasn't necessarily moved us forward.",
      body: `<p class="first">In the rush to deliver real-time metrics and near-instant deployment, we have built systems that prioritize rapid turnover over architectural durability. The result is a persistent feeling of motion without displacement.</p>
<p>True structural progress requires a willingness to slow the iteration loop down. It demands time to think, time to design, and time to build things that can stand for longer than a single business cycle.</p>`,
      categoryId: dbCategories['opinion'].id,
      heroImage: 'https://picsum.photos/id/1010/800/600',
      caption: 'A solitary pedestrian walking through a high-contrast urban passage.',
      status: 'PUBLISHED',
      isOpinion: true,
      readTime: 5,
      publishDate: new Date('2026-07-17T08:00:00.000Z'),
      authors: { connect: [{ id: authorRohan.id }] },
      tags: { connect: [{ id: dbTags['Slow Living'].id }] },
    },
    {
      // Opinion 2
      title: "The office was never the problem",
      slug: "office-never-the-problem",
      deck: "The debates around remote vs. hybrid work focus on geography, missing the structural erosion of workplace trust.",
      body: `<p class="first">For three years, the corporate conversation has circled around badge swipes and commute times. But the quiet crisis isn't about physical presence; it's about the decay of shared understanding and institutional trust.</p>
<p>Working in physical proximity did not make companies productive; it merely masked the absence of clear communication channels and documentation. Remote setups have only laid bare these pre-existing flaws.</p>`,
      categoryId: dbCategories['opinion'].id,
      heroImage: 'https://picsum.photos/id/1018/800/600',
      caption: 'An empty corner office captured in monochrome shadows.',
      status: 'PUBLISHED',
      isOpinion: true,
      readTime: 6,
      publishDate: new Date('2026-07-16T11:00:00.000Z'),
      authors: { connect: [{ id: authorMeera.id }] },
      tags: { connect: [{ id: dbTags['Workplace'].id }] },
    },
    {
      // Opinion 3
      title: "What we owe the next reader",
      slug: "what-we-owe-next-reader",
      deck: "Digital interfaces treat text as fleeting impressions. An argument for the archival permanence of news.",
      body: `<p class="first">Physical news possessed a natural permanence; once printed, it could not be silently edited or deleted. Today's digital text is fluid, constantly updating and vanishing behind paywalls and linkrot.</p>
<p>We must redesign modern news archives with the next reader in mind. This means static rendering, immutable records, and an appreciation for print-like clarity that survives device cycles.</p>`,
      categoryId: dbCategories['opinion'].id,
      heroImage: 'https://picsum.photos/id/1020/800/600',
      caption: 'Stacked historical papers resting on a shelf.',
      status: 'PUBLISHED',
      isOpinion: true,
      readTime: 4,
      publishDate: new Date('2026-07-15T09:00:00.000Z'),
      authors: { connect: [{ id: authorChandran.id }] },
      tags: { connect: [{ id: dbTags['Literature'].id }] },
    },
    {
      title: "Three coalition governments, one shared script",
      slug: "three-coalition-governments-shared-script",
      deck: "Across three continents, fragile majorities are reaching for the same emergency playbook — with mixed results.",
      body: `<p class="first">The structural dynamics of modern coalitions have begun to converge on a single management formula. Faced with disparate internal factions, leaders are prioritizing external threat narratives over domestic compromise.</p>
<p>This script relies heavily on fast-paced regulatory interventions that keep partners distracted, leaving little time for long-term domestic policies.</p>`,
      categoryId: dbCategories['politics'].id,
      heroImage: 'https://picsum.photos/id/1015/400/300',
      caption: 'A legislative hall empty after evening sessions.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 7,
      publishDate: new Date('2026-07-15T15:00:00.000Z'),
      authors: { connect: [{ id: authorImran.id }] },
      tags: { connect: [{ id: dbTags['Geopolitics'].id }] },
    },
    {
      title: "The ministry nobody wanted, and why that's changing",
      slug: "ministry-nobody-wanted-why-changing",
      deck: "A once-overlooked portfolio has become the most contested seat at the table.",
      body: `<p class="first">Historically, ministries governing natural resources and shipping routes were quiet outposts. Today, as environmental shifts trigger severe trade disputes, these desks are the new command centers.</p>
<p>The sudden political visibility of these roles has triggered intense friction in cabinets, changing national security policy in real-time.</p>`,
      categoryId: dbCategories['india'].id,
      heroImage: 'https://picsum.photos/id/1016/400/300',
      caption: 'Administrative office gates casting deep vertical shadows.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 6,
      publishDate: new Date('2026-07-14T09:00:00.000Z'),
      authors: { connect: [{ id: authorNaina.id }] },
      tags: { connect: [{ id: dbTags['Federal Budget'].id }, { id: dbTags['Infrastructure'].id }] },
    },
    {
      title: "The return of the long dinner",
      slug: "return-long-dinner",
      deck: "Why three-hour meals are back, and what they say about how we want to spend time.",
      body: `<p class="first">Slow culinary gatherings are witnessing a major revival in major cities. Guests are rejecting fast-casual dining in favor of structured, multi-hour experiences that emphasize slow conversation.</p>
<p>This shift represents a direct rebellion against the digital hyper-acceleration that dominates our workdays.</p>`,
      categoryId: dbCategories['culture'].id,
      heroImage: 'https://picsum.photos/id/1025/500/400',
      caption: 'A dimly lit dinner setting in high contrast.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 7,
      publishDate: new Date('2026-07-13T18:00:00.000Z'),
      authors: { connect: [{ id: editor.id }] },
      tags: { connect: [{ id: dbTags['Slow Living'].id }] },
    },
    {
      title: "Inside the last analog darkroom in the city",
      slug: "inside-last-analog-darkroom-city",
      deck: "A holdout studio, a waiting list, and a craft that refuses to disappear.",
      body: `<p class="first">Nestled in an old printing basement, the city's sole remaining silver-halide darkroom is booked months in advance. Young photographers are abandoning instant filters for the slow, chemical alchemy of film development.</p>
<p>The tactile discipline of measuring developers and waiting in red light has become a meditation on photographic intentionality.</p>`,
      categoryId: dbCategories['lifestyle'].id,
      heroImage: 'https://picsum.photos/id/1039/500/400',
      caption: 'An array of developer trays sitting under a red safelight.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 5,
      publishDate: new Date('2026-07-12T10:00:00.000Z'),
      authors: { connect: [{ id: author2.id }] },
      tags: { connect: [{ id: dbTags['Analog'].id }] },
    },
    {
      title: "The wardrobe that fits in one shelf",
      slug: "wardrobe-fits-one-shelf",
      deck: "A quiet movement toward fewer, better things is reshaping how people dress.",
      body: `<p class="first">A segment of urban professionals is adopting extreme wardrobe minimalism. Relying on local linen and heavy cotton staples, they restrict their clothing to a single modular shelf.</p>
<p>This curation represents an aesthetic pivot away from consumerist cycles toward long-term material utility.</p>`,
      categoryId: dbCategories['lifestyle'].id,
      heroImage: 'https://picsum.photos/id/1043/500/400',
      caption: 'Neatly folded high-contrast fabrics resting in a shelf.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 5,
      publishDate: new Date('2026-07-11T11:00:00.000Z'),
      authors: { connect: [{ id: author1.id }] },
      tags: { connect: [{ id: dbTags['Slow Living'].id }] },
    },
    {
      // A workflow-testing article: DRAFT from Author
      title: "The future of digital news is black and white",
      slug: "future-digital-news-black-white",
      deck: "Why SERA's grayscale editorial design represents a return to content focus.",
      body: `<p class="first">Color is an easy distraction. By stripping away chromatic saturation, we force the reader's focus back to typography, composition, and writing quality.</p>
<p>Grayscale design is not a retro aesthetic; it is a design choice to combat cognitive fatigue in a saturated web environment.</p>`,
      categoryId: dbCategories['technology'].id,
      heroImage: 'https://picsum.photos/id/1042/800/600',
      caption: 'High contrast text grids displayed on an e-ink screen.',
      status: 'DRAFT',
      isOpinion: false,
      readTime: 4,
      authors: { connect: [{ id: author1.id }] },
      tags: { connect: [{ id: dbTags['Infrastructure'].id }] },
    },
    {
      // A workflow-testing article: PENDING_ADMIN from Editor
      title: "Why local printing presses are returning",
      slug: "why-local-printing-presses-returning",
      deck: "Small independent shops are investing in letterpresses, finding demand in local physical distribution.",
      body: `<p class="first">Small physical printing presses are popping up in metropolitan hubs, serving micro-newsletters and localized art brochures. Readers want to touch ink.</p>`,
      categoryId: dbCategories['business'].id,
      heroImage: 'https://picsum.photos/id/1044/800/600',
      caption: 'A heavy mechanical letterpress printing text blocks.',
      status: 'PENDING_ADMIN',
      isOpinion: false,
      readTime: 3,
      authors: { connect: [{ id: editor.id }] },
      tags: { connect: [{ id: dbTags['Analog'].id }] },
    },
    {
      title: "An Interview with Sarah Thorne on Analog Longevity",
      slug: "interview-sarah-thorne-analog-longevity",
      deck: "The screen icon discusses her decision to move off social networks and focus on theatrical film print archives.",
      body: `<p class="first">Sarah Thorne, celebrated for her decades in character cinema, sits down with SERA to discuss why she refuses to allow digital distribution of her archives.</p>
<p>"Physical film contains a grain that represents time. Digital pixels represent a copy of time," she tells us. Her archives will be housed in an e-ink indexed facility.</p>`,
      categoryId: dbCategories['celebrity'].id,
      heroImage: 'https://picsum.photos/id/1062/800/600',
      caption: 'A high-contrast profile of Sarah Thorne looking out a window.',
      status: 'PUBLISHED',
      isOpinion: false,
      readTime: 6,
      publishDate: new Date('2026-07-15T14:00:00.000Z'),
      authors: { connect: [{ id: author1.id }] },
      tags: { connect: [{ id: dbTags['Analog'].id }, { id: dbTags['Slow Living'].id }] },
    },
  ];

  for (const art of sampleArticles) {
    await prisma.article.create({
      data: art,
    });
  }
  console.log('Sample articles seeded.');

  // Pin some seeded articles to Headlines for layout presentation
  console.log('Pinning breaking stories to headlines strip...');
  await prisma.article.updateMany({
    where: {
      slug: {
        in: [
          "interview-sarah-thorne-analog-longevity",
          "inside-last-analog-darkroom-city",
          "chips-fine-cooling-breaks-first",
          "mistaking-speed-for-progress"
        ]
      }
    },
    data: {
      isPinnedToHeadlines: true,
    }
  });

  // Assign ordering weights
  await prisma.article.update({
    where: { slug: "interview-sarah-thorne-analog-longevity" },
    data: { headlineOrder: 1 }
  });
  await prisma.article.update({
    where: { slug: "inside-last-analog-darkroom-city" },
    data: { headlineOrder: 2 }
  });
  await prisma.article.update({
    where: { slug: "chips-fine-cooling-breaks-first" },
    data: { headlineOrder: 3 }
  });
  await prisma.article.update({
    where: { slug: "mistaking-speed-for-progress" },
    data: { headlineOrder: 4 }
  });

  // Seed view events for trending calculation velocity
  const dbArticles = await prisma.article.findMany();
  console.log('Seeding trending view velocity events...');
  const now = new Date();
  for (const art of dbArticles) {
    let count = 0;
    if (art.slug === "interview-sarah-thorne-analog-longevity") count = 38;
    else if (art.slug === "quiet-race-control-worlds-cooling-supply-chains") count = 30;
    else if (art.slug === "chips-fine-cooling-breaks-first") count = 22;
    else if (art.slug === "mistaking-speed-for-progress") count = 16;
    else if (art.slug === "office-never-the-problem") count = 12;

    for (let i = 0; i < count; i++) {
      const minutesAgo = Math.floor(Math.random() * 300); // within last 5 hours
      const eventTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
      await prisma.viewEvent.create({
        data: {
          articleId: art.id,
          createdAt: eventTime,
        }
      });
    }
  }
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
