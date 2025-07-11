import "reflect-metadata";
import { initializeDatabase, getRepository } from "./typeorm.js";
import { Organisation } from "./entities/Organisation.js";
import { User } from "./entities/User.js";
import { Ticket } from "./entities/Ticket.js";
import { TICKET_STATUS } from "../constants/index.js";

const exampleSeedData = {
  organisations: [
    { name: 'TechCorp Solutions' },
    { name: 'Digital Innovations Ltd' },
    { name: 'Cloud Systems Inc' },
    { name: 'DataFlow Analytics' },
    { name: 'SecureNet Technologies' },
    { name: 'MobileFirst Apps' },
    { name: 'AI Research Labs' },
    { name: 'Blockchain Ventures' }
  ],
  
  users: [
    { name: 'Sarah Mitchell', organisationId: 1 },
    { name: 'Michael Rodriguez', organisationId: 1 },
    { name: 'Emily Chen', organisationId: 1 },
    { name: 'James Thompson', organisationId: 2 },
    { name: 'Lisa Park', organisationId: 2 },
    { name: 'Robert Kim', organisationId: 2 },
    { name: 'Jennifer Walsh', organisationId: 3 },
    { name: 'Daniel O\'Connor', organisationId: 3 },
    { name: 'Amanda Foster', organisationId: 4 },
    { name: 'Christopher Reed', organisationId: 4 },
    { name: 'Nicole Garcia', organisationId: 5 },
    { name: 'Kevin Martinez', organisationId: 5 },
    { name: 'Rachel Turner', organisationId: 6 },
    { name: 'Andrew Phillips', organisationId: 6 },
    { name: 'Stephanie Campbell', organisationId: 7 },
    { name: 'Brandon Evans', organisationId: 7 },
    { name: 'Megan Collins', organisationId: 8 },
    { name: 'Ryan Stewart', organisationId: 8 }
  ],
  
  tickets: [
    {
      title: 'Database performance optimization needed',
      description: 'Production database queries are taking too long. Need to optimize indexes and query performance.',
      status: TICKET_STATUS.OPEN,
      userId: 1,
      organisationId: 1
    },
    {
      title: 'API rate limiting implementation',
      description: 'Need to implement rate limiting for our public API to prevent abuse and ensure fair usage.',
      status: TICKET_STATUS.IN_PROGRESS,
      userId: 2,
      organisationId: 1
    },
    {
      title: 'CI/CD pipeline broken',
      description: 'Automated deployment pipeline is failing on the staging environment. Build process needs fixing.',
      status: TICKET_STATUS.OPEN,
      userId: 3,
      organisationId: 1
    },
    {
      title: 'User authentication system upgrade',
      description: 'Current authentication system needs to be upgraded to support OAuth 2.0 and multi-factor authentication.',
      status: TICKET_STATUS.PENDING,
      userId: 4,
      organisationId: 2
    },
    {
      title: 'Frontend responsive design issues',
      description: 'Mobile version of the web application has layout issues on various screen sizes.',
      status: TICKET_STATUS.OPEN,
      userId: 5,
      organisationId: 2
    },
    {
      title: 'Third-party integration failure',
      description: 'Payment gateway integration is returning errors. Need to investigate and fix the connection.',
      status: TICKET_STATUS.OPEN,
      userId: 6,
      organisationId: 2
    },
    {
      title: 'Cloud infrastructure scaling',
      description: 'Need to implement auto-scaling for our cloud infrastructure to handle traffic spikes.',
      status: TICKET_STATUS.IN_PROGRESS,
      userId: 7,
      organisationId: 3
    },
    {
      title: 'Data backup verification',
      description: 'Automated backup verification process is not working. Need to fix and ensure data integrity.',
      status: TICKET_STATUS.OPEN,
      userId: 8,
      organisationId: 3
    },
    {
      title: 'Machine learning model deployment',
      description: 'New ML model needs to be deployed to production. Requires infrastructure setup and monitoring.',
      status: TICKET_STATUS.PENDING,
      userId: 9,
      organisationId: 4
    },
    {
      title: 'Real-time analytics dashboard',
      description: 'Need to build a real-time analytics dashboard for monitoring system performance metrics.',
      status: TICKET_STATUS.OPEN,
      userId: 10,
      organisationId: 4
    },
    {
      title: 'Security vulnerability patch',
      description: 'Critical security vulnerability found in our authentication library. Need immediate patch deployment.',
      status: TICKET_STATUS.OPEN,
      userId: 11,
      organisationId: 5
    },
    {
      title: 'Penetration testing setup',
      description: 'Need to set up automated penetration testing for our web applications.',
      status: TICKET_STATUS.PENDING,
      userId: 12,
      organisationId: 5
    },
    {
      title: 'Mobile app push notifications',
      description: 'Push notification service is not working on iOS devices. Need to fix the implementation.',
      status: TICKET_STATUS.OPEN,
      userId: 13,
      organisationId: 6
    },
    {
      title: 'App store optimization',
      description: 'Need to optimize app store listings and improve app discoverability.',
      status: TICKET_STATUS.PENDING,
      userId: 14,
      organisationId: 6
    },
    {
      title: 'AI model training pipeline',
      description: 'Need to set up automated training pipeline for our machine learning models.',
      status: TICKET_STATUS.IN_PROGRESS,
      userId: 15,
      organisationId: 7
    },
    {
      title: 'Data preprocessing automation',
      description: 'Manual data preprocessing is time-consuming. Need to automate the process.',
      status: TICKET_STATUS.OPEN,
      userId: 16,
      organisationId: 7
    },
    {
      title: 'Smart contract audit',
      description: 'New smart contract needs security audit before deployment to mainnet.',
      status: TICKET_STATUS.PENDING,
      userId: 17,
      organisationId: 8
    },
    {
      title: 'Blockchain node synchronization',
      description: 'Private blockchain nodes are out of sync. Need to fix synchronization issues.',
      status: TICKET_STATUS.OPEN,
      userId: 18,
      organisationId: 8
    },
    {
      title: 'Microservices architecture review',
      description: 'Current microservices architecture needs review and optimization for better performance.',
      status: TICKET_STATUS.IN_PROGRESS,
      userId: 1,
      organisationId: 1
    },
    {
      title: 'Load testing infrastructure',
      description: 'Need to set up comprehensive load testing for our web services.',
      status: TICKET_STATUS.PENDING,
      userId: 4,
      organisationId: 2
    },
    {
      title: 'Monitoring and alerting system',
      description: 'Current monitoring system is not comprehensive enough. Need to implement better alerting.',
      status: TICKET_STATUS.OPEN,
      userId: 7,
      organisationId: 3
    },
    {
      title: 'Data warehouse migration',
      description: 'Need to migrate from current data warehouse to a more scalable solution.',
      status: TICKET_STATUS.PENDING,
      userId: 9,
      organisationId: 4
    },
    {
      title: 'Compliance audit preparation',
      description: 'Upcoming compliance audit requires preparation and documentation updates.',
      status: TICKET_STATUS.OPEN,
      userId: 11,
      organisationId: 5
    },
    {
      title: 'Cross-platform app development',
      description: 'Need to develop cross-platform mobile app using React Native.',
      status: TICKET_STATUS.IN_PROGRESS,
      userId: 13,
      organisationId: 6
    },
    {
      title: 'Natural language processing API',
      description: 'Need to develop NLP API for text analysis and sentiment detection.',
      status: TICKET_STATUS.PENDING,
      userId: 15,
      organisationId: 7
    },
    {
      title: 'DeFi protocol integration',
      description: 'Need to integrate with popular DeFi protocols for our blockchain application.',
      status: TICKET_STATUS.OPEN,
      userId: 17,
      organisationId: 8
    }
  ]
};

async function clearTables() {
  console.log('Clearing existing data...');
  
  try {
    const ticketRepo = getRepository(Ticket);
    const userRepo = getRepository(User);
    const orgRepo = getRepository(Organisation);
    
    await ticketRepo.clear();
    await userRepo.clear();
    await orgRepo.clear();
    
    console.log('Tables cleared successfully');
  } catch (error) {
    console.error('Error clearing tables:', error);
    throw error;
  }
}

async function seedOrganisations() {
  console.log('Seeding organisations...');
  
  const orgRepo = getRepository(Organisation);
  
  for (const orgData of exampleSeedData.organisations) {
    try {
      const organisation = orgRepo.create(orgData);
      await orgRepo.save(organisation);
    } catch (error) {
      console.error('Error inserting organisation:', orgData.name, error);
      throw error;
    }
  }
  
  console.log(`Inserted ${exampleSeedData.organisations.length} organisations`);
}

async function seedUsers() {
  console.log('Seeding users...');
  
  const userRepo = getRepository(User);
  
  for (const userData of exampleSeedData.users) {
    try {
      const user = userRepo.create(userData);
      await userRepo.save(user);
    } catch (error) {
      console.error('Error inserting user:', userData.name, error);
      throw error;
    }
  }
  
  console.log(`Inserted ${exampleSeedData.users.length} users`);
}

async function seedTickets() {
  console.log('Seeding tickets...');
  
  const ticketRepo = getRepository(Ticket);
  
  for (const ticketData of exampleSeedData.tickets) {
    try {
      const ticket = ticketRepo.create(ticketData);
      await ticketRepo.save(ticket);
    } catch (error) {
      console.error('Error inserting ticket:', ticketData.title, error);
      throw error;
    }
  }
  
  console.log(`Inserted ${exampleSeedData.tickets.length} tickets`);
}

async function runExampleSeed() {
  try {
    console.log('Starting example database seeding with TypeORM...');
    
    await initializeDatabase();
    await clearTables();
    await seedOrganisations();
    await seedUsers();
    await seedTickets();
    
    console.log('Example database seeding completed successfully!');
    
    // Display summary
    const orgRepo = getRepository(Organisation);
    const userRepo = getRepository(User);
    const ticketRepo = getRepository(Ticket);
    
    const orgCount = await orgRepo.count();
    const userCount = await userRepo.count();
    const ticketCount = await ticketRepo.count();
    
    console.log('\nExample Seeding Summary:');
    console.log(`- Organisations: ${orgCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Tickets: ${ticketCount}`);
    
    // Display status distribution
    const statusStats = await ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();
    
    console.log('\nTicket Status Distribution:');
    statusStats.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('Example seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExampleSeed();
}

export { runExampleSeed, exampleSeedData };
