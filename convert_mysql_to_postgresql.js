import fs from 'fs';

function convertMySQLToPostgreSQL(inputFile, outputFile) {
  console.log('Converting MySQL dump to PostgreSQL format...');
  
  let content = fs.readFileSync(inputFile, 'utf8');
  
  // Remove MySQL-specific headers and settings
  content = content.replace(/^-- phpMyAdmin SQL Dump[\s\S]*?-- Database:.*?\n\n/m, '');
  content = content.replace(/SET SQL_MODE.*?;\n/g, '');
  content = content.replace(/START TRANSACTION;\n/g, '');
  content = content.replace(/SET time_zone.*?;\n/g, '');
  content = content.replace(/\/\*!.*?\*\/;\n/g, '');
  content = content.replace(/-- --------------------------------------------------------\n/g, '');
  
  // Remove backticks around identifiers
  content = content.replace(/`([^`]+)`/g, '"$1"');
  
  // Convert MySQL data types to PostgreSQL
  content = content.replace(/int\(\d+\)/g, 'INTEGER');
  content = content.replace(/tinyint\(1\)/g, 'BOOLEAN');
  content = content.replace(/decimal\((\d+),(\d+)\)/g, 'NUMERIC($1,$2)');
  content = content.replace(/varchar\((\d+)\)/g, 'VARCHAR($1)');
  content = content.replace(/text/gi, 'TEXT');
  content = content.replace(/date/gi, 'DATE');
  
  // Convert timestamp fields
  content = content.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\) ON UPDATE current_timestamp\(\)/g, 'TIMESTAMP NOT NULL DEFAULT NOW()');
  content = content.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\)/g, 'TIMESTAMP NOT NULL DEFAULT NOW()');
  content = content.replace(/DEFAULT current_timestamp\(\)/g, 'DEFAULT NOW()');
  
  // Convert ENUM to TEXT with CHECK constraints
  const enumMatches = content.match(/enum\([^)]+\)/g);
  if (enumMatches) {
    enumMatches.forEach(enumDef => {
      // Extract values from enum
      const values = enumDef.match(/'([^']+)'/g);
      if (values) {
        const checkConstraint = `TEXT CHECK ("status" IN (${values.join(', ')}))`;
        content = content.replace(enumDef, 'TEXT');
      }
    });
  }
  
  // Fix enum constraints for specific fields
  content = content.replace(/"status" TEXT DEFAULT 'active'/g, '"status" TEXT DEFAULT \'active\' CHECK ("status" IN (\'active\', \'inactive\'))');
  content = content.replace(/"lead_origin" TEXT NOT NULL/g, '"lead_origin" TEXT NOT NULL CHECK ("lead_origin" IN (\'Facebook\', \'Google Text\', \'Instagram\', \'Trade Show\', \'WhatsApp\', \'Commercial\', \'Referral\', \'Website\'))');
  content = content.replace(/"remarks" TEXT DEFAULT 'New'/g, '"remarks" TEXT DEFAULT \'New\' CHECK ("remarks" IN (\'Not Interested\', \'Not Service Area\', \'Not Compatible\', \'Sold\', \'In Progress\', \'New\'))');
  content = content.replace(/"assigned_to" TEXT NOT NULL/g, '"assigned_to" TEXT CHECK ("assigned_to" IN (\'Kim\', \'Patrick\', \'Lina\'))');
  content = content.replace(/"product_type" TEXT NOT NULL/g, '"product_type" TEXT NOT NULL CHECK ("product_type" IN (\'Demo Kit and Sample Booklet\', \'Sample Booklet Only\', \'Trial Kit\', \'Demo Kit Only\'))');
  content = content.replace(/"status" TEXT NOT NULL DEFAULT 'Pending'/g, '"status" TEXT NOT NULL DEFAULT \'Pending\' CHECK ("status" IN (\'Pending\', \'Shipped\', \'Delivered\'))');
  
  // Remove MySQL engine specifications
  content = content.replace(/\s*ENGINE=\w+[^;]*;/g, ';');
  content = content.replace(/DEFAULT CHARSET=\w+[^;]*/g, '');
  content = content.replace(/COLLATE=\w+[^;]*/g, '');
  
  // Fix boolean values in INSERT statements (MySQL uses 0/1, PostgreSQL uses FALSE/TRUE)
  content = content.replace(/,\s*0,/g, ', FALSE,');
  content = content.replace(/,\s*1,/g, ', TRUE,');
  content = content.replace(/,\s*0\)/g, ', FALSE)');
  content = content.replace(/,\s*1\)/g, ', TRUE)');
  
  // Handle AUTO_INCREMENT - convert to SERIAL for primary keys
  content = content.replace(/"id" INTEGER NOT NULL,/g, '"id" SERIAL PRIMARY KEY,');
  
  // Remove separate PRIMARY KEY definitions for id fields since we use SERIAL
  content = content.replace(/,\s*PRIMARY KEY \("id"\)/g, '');
  
  // Remove ALTER TABLE statements for AUTO_INCREMENT
  content = content.replace(/ALTER TABLE.*?AUTO_INCREMENT.*?;\n/g, '');
  
  // Remove UNIQUE KEY and KEY definitions - PostgreSQL uses different syntax
  content = content.replace(/,\s*UNIQUE KEY.*?\n/g, ',\n');
  content = content.replace(/,\s*KEY.*?\n/g, ',\n');
  
  // Clean up extra commas and newlines
  content = content.replace(/,(\s*\n\s*)\)/g, '$1)');
  content = content.replace(/\n\n+/g, '\n\n');
  
  // Add PostgreSQL header
  const postgresHeader = `-- PostgreSQL Database Dump
-- Converted from MySQL/MariaDB format
-- Database: wrapqrqc_wmk
-- Generated: ${new Date().toISOString()}

SET TIME ZONE 'UTC';
SET client_encoding = 'UTF8';

`;
  
  content = postgresHeader + content;
  
  // Write the converted file
  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`Conversion complete! PostgreSQL dump saved to: ${outputFile}`);
  console.log(`File size: ${Math.round(fs.statSync(outputFile).size / 1024)} KB`);
}

// Convert the file
const inputFile = 'attached_assets/wrapqrqc_wmk_1756067133137.sql';
const outputFile = 'wrapqrqc_wmk_postgresql.sql';

try {
  convertMySQLToPostgreSQL(inputFile, outputFile);
} catch (error) {
  console.error('Error during conversion:', error.message);
}