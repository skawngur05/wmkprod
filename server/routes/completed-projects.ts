import { Router } from 'express';
import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { leads } from '@shared/schema';

const router = Router();

// Search completed projects by email or phone
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }
    
    const searchTerm = q.trim();
    
    // Search for leads that are marked as "Sold" and have installation_date (completed projects)
    const results = await db.select()
      .from(leads)
      .where(
        and(
          eq(leads.remarks, 'Sold'),
          or(
            like(leads.email, `%${searchTerm}%`),
            like(leads.phone, `%${searchTerm}%`),
            like(leads.name, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(leads.installation_date))
      .limit(10);
    
    res.json(results);
  } catch (error) {
    console.error('Error searching completed projects:', error);
    res.status(500).json({ error: 'Failed to search completed projects' });
  }
});

export default router;
