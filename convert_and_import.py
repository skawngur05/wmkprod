#!/usr/bin/env python3
import re
import uuid
import psycopg2
import os

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')

def convert_lead_origin(origin):
    """Convert lead origin to match current schema format"""
    mapping = {
        'Facebook': 'facebook',
        'Google Text': 'google',
        'Instagram': 'instagram', 
        'Trade Show': 'trade-show',
        'WhatsApp': 'whatsapp',
        'Commercial': 'commercial',
        'Referral': 'referral',
        'Website': 'website',
        'Phone': 'phone',
        'Email': 'email'
    }
    return mapping.get(origin, origin.lower())

def convert_remarks(remarks):
    """Convert remarks to match current schema format"""
    mapping = {
        'Not Interested': 'not-interested',
        'Not Service Area': 'not-service-area',
        'Not Compatible': 'not-compatible',
        'Sold': 'sold',
        'In Progress': 'in-progress',
        'New': 'new'
    }
    return mapping.get(remarks, 'new')

def convert_assignee(assignee):
    """Convert assignee to match current schema format"""
    mapping = {
        'Kim': 'kim',
        'Patrick': 'patrick', 
        'Lina': 'lina'
    }
    return mapping.get(assignee, assignee.lower() if assignee else None)

def convert_installer(installer):
    """Convert installer to match current schema format"""
    if not installer:
        return None
    mapping = {
        'Angel': 'angel',
        'Brian': 'brian',
        'Luis': 'luis'
    }
    return mapping.get(installer, installer.lower())

def parse_leads_from_sql(filename):
    """Parse leads data from SQL file"""
    with open(filename, 'r') as f:
        content = f.read()
    
    # Find all data rows (lines starting with opening parenthesis)
    data_pattern = r'\((\d+),\s*\'([^\']*)\',\s*\'([^\']*)\',\s*\'([^\']*)\',\s*\'([^\']*)\',\s*(?:\'([^\']*)\',|NULL,)\s*(?:\'([^\']*)\',|NULL,)\s*(?:\'([^\']*)\',|NULL,)\s*(?:\'([^\']*)\',|NULL,)\s*\'([^\']*)\',\s*\'([^\']*)\',\s*(\d+\.?\d*),\s*\'([^\']*)\',\s*\'([^\']*)\',\s*([01]),\s*([01]),\s*(?:\'([^\']*)\',|NULL,)\s*(?:\'([^\']*)\',|NULL,)\s*\)(?:,|\;)'
    
    leads = []
    lines = content.split('\n')
    
    current_values = []
    in_values_section = False
    
    for line in lines:
        line = line.strip()
        if line.startswith('INSERT INTO'):
            in_values_section = True
            continue
        elif in_values_section and line.startswith('('):
            # Extract data from parentheses, handling multi-line values
            current_values.append(line)
        elif in_values_section and not line:
            # Empty line marks end of INSERT section
            in_values_section = False
            # Process collected values
            full_values = ' '.join(current_values)
            # Parse individual records
            matches = re.findall(r'\(([^)]+)\)', full_values)
            for match in matches:
                parts = [p.strip().strip("'") for p in match.split(',')]
                if len(parts) >= 16:  # Ensure we have enough data fields
                    leads.append(parts)
            current_values = []
    
    return leads

def import_leads(leads):
    """Import leads data into database"""
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return
        
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    imported_count = 0
    
    for lead_data in leads:
        try:
            # Generate UUID for this lead
            lead_id = str(uuid.uuid4())
            
            # Parse the lead data (adjust indices based on your SQL structure)
            if len(lead_data) < 16:
                continue
                
            original_id = lead_data[0]
            date_created = lead_data[1] if lead_data[1] != 'NULL' else None
            lead_origin = convert_lead_origin(lead_data[2])
            name = lead_data[3]
            phone = lead_data[4] if lead_data[4] != 'NULL' else ''
            email = lead_data[5] if lead_data[5] != 'NULL' else None
            next_followup_date = lead_data[6] if lead_data[6] != 'NULL' else None
            remarks = convert_remarks(lead_data[7]) if lead_data[7] != 'NULL' else 'new'
            assigned_to = convert_assignee(lead_data[8]) if lead_data[8] != 'NULL' else None
            notes = lead_data[9] if lead_data[9] != 'NULL' else ''
            additional_notes = lead_data[10] if lead_data[10] != 'NULL' else ''
            project_amount = float(lead_data[11]) if lead_data[11] != 'NULL' else 0
            deposit_paid = bool(int(lead_data[14])) if lead_data[14] != 'NULL' else False
            balance_paid = bool(int(lead_data[15])) if lead_data[15] != 'NULL' else False
            installation_date = lead_data[16] if len(lead_data) > 16 and lead_data[16] != 'NULL' else None
            assigned_installer = convert_installer(lead_data[17]) if len(lead_data) > 17 and lead_data[17] != 'NULL' else None
            
            # Insert lead
            cur.execute("""
                INSERT INTO leads (
                    id, name, phone, email, lead_origin, date_created,
                    next_followup_date, remarks, assigned_to, project_amount,
                    notes, additional_notes, deposit_paid, balance_paid,
                    installation_date, assigned_installer
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                lead_id, name, phone, email, lead_origin, date_created,
                next_followup_date, remarks, assigned_to, project_amount,
                notes, additional_notes, deposit_paid, balance_paid,
                installation_date, assigned_installer
            ))
            
            imported_count += 1
            
        except Exception as e:
            print(f"Error importing lead {original_id}: {e}")
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Successfully imported {imported_count} leads")

if __name__ == "__main__":
    print("Converting and importing leads data...")
    leads = parse_leads_from_sql('leads_data.sql')
    print(f"Found {len(leads)} leads to import")
    import_leads(leads)