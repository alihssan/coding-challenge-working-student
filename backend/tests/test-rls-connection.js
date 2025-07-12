import { AppDataSource } from '../config/database.js';
import { TicketRepository } from '../db/repositories/TicketRepository.js';

async function testRLS() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected');

    // Create repository
    const ticketRepo = new TicketRepository(AppDataSource);
    
    // Test setting current user
    console.log('Testing setCurrentUser...');
    await ticketRepo.setCurrentUser(1);
    
    // Test query with RLS
    console.log('Testing query with RLS...');
    const result = await ticketRepo.findAllWithRLS({}, 1);
    
    console.log('Tickets found:', result.tickets.length);
    console.log('First few tickets:');
    result.tickets.slice(0, 3).forEach(ticket => {
      console.log(`- ID: ${ticket.id}, Title: ${ticket.title}, Org: ${ticket.organisation.name}`);
    });
    
    // Test direct query to see if RLS is working
    console.log('\nTesting direct query...');
    const directResult = await ticketRepo.query('SELECT COUNT(*) as count FROM tickets');
    console.log('Direct query count:', directResult[0].count);
    
    // Test RLS functions directly
    console.log('\nTesting RLS functions...');
    const rlsResult = await ticketRepo.query(`
      SELECT set_current_user_id(1);
      SELECT get_current_user_organisation_id() as org_id;
      SELECT COUNT(*) as count FROM tickets;
    `);
    console.log('RLS query results:', rlsResult);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testRLS(); 