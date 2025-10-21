const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function updateOverdueLeads() {
  const overdueIds = [1583, 1591, 2069, 1921, 1918];
  const todayDate = '2025-10-13';
  
  console.log('Updating overdue leads to have follow-up date set to today...');
  
  for (const id of overdueIds) {
    try {
      const response = await fetch(`http://localhost:3001/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          next_followup_date: todayDate
        })
      });
      
      if (response.ok) {
        console.log(`✅ Updated lead ${id} follow-up date to ${todayDate}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to update lead ${id}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error updating lead ${id}: ${error.message}`);
    }
  }
  
  console.log('\nUpdate complete. The overdue count should now be 0.');
}

updateOverdueLeads().catch(console.error);
