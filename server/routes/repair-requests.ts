import { Router } from 'express';
import { eq, like, or, desc } from 'drizzle-orm';
import { db } from '../db';
import { repairRequests, leads, insertRepairRequestSchema } from '@shared/schema';

const router = Router();

// Get all repair requests
router.get('/', async (req, res) => {
  try {
    const requests = await db.select().from(repairRequests).orderBy(desc(repairRequests.created_at));
    res.json(requests);
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    res.status(500).json({ error: 'Failed to fetch repair requests' });
  }
});

// Create new repair request
router.post('/', async (req, res) => {
  try {
    const validatedData = insertRepairRequestSchema.parse(req.body);
    
    const [newRequest] = await db.insert(repairRequests).values({
      ...validatedData,
      date_reported: new Date(validatedData.date_reported || new Date()),
    });

    res.json({ id: newRequest.insertId, ...validatedData });
  } catch (error) {
    console.error('Error creating repair request:', error);
    res.status(400).json({ error: 'Failed to create repair request' });
  }
});

// Update repair request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await db.update(repairRequests)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(repairRequests.id, parseInt(id)));

    res.json({ message: 'Repair request updated successfully' });
  } catch (error) {
    console.error('Error updating repair request:', error);
    res.status(500).json({ error: 'Failed to update repair request' });
  }
});

// Delete repair request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(repairRequests).where(eq(repairRequests.id, parseInt(id)));
    
    res.json({ message: 'Repair request deleted successfully' });
  } catch (error) {
    console.error('Error deleting repair request:', error);
    res.status(500).json({ error: 'Failed to delete repair request' });
  }
});

export default router;
