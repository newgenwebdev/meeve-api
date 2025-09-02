const express = require('express');
const mysql = require('mysql2');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const router = express.Router();


// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root_password',
  port: '3307',
  database: 'my_database'
});

// Helper function to load data from the database
async function loadDatabaseData() {
  const query = `
    SELECT RoundId, SUM(BetAmount) AS BetAmount, SUM(Payout) AS Payout
    FROM GameLogEvolution
    WHERE Status = 'Y'
      AND WagerTime BETWEEN '2025-02-01 00:00:00' AND '2025-03-01 00:00:00'
      AND AgentId IN (22, 130)
    GROUP BY RoundId
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

// Helper function to load data from the Excel file
async function loadExcelData(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const excelData = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip the header row
      const roundId = row.getCell(1).value;
      const betAmount = row.getCell(2).value;
      const payout = row.getCell(3).value;
      excelData.push({ roundId, betAmount, payout });
    }
  });

  return excelData;
}

// Compare Database and Excel Data
function findDifferences(dbData, excelData) {
  const differences = [];

  const dbDict = dbData.reduce((acc, row) => {
    acc[row.RoundId] = { BetAmount: row.BetAmount, Payout: row.Payout };
    return acc;
  }, {});

  const excelDict = excelData.reduce((acc, row) => {
    acc[row.roundId] = { BetAmount: row.betAmount, Payout: row.payout };
    return acc;
  }, {});

  const allKeys = new Set([...Object.keys(dbDict), ...Object.keys(excelDict)]);

  allKeys.forEach(key => {
    const dbRow = dbDict[key] || { BetAmount: 0, Payout: 0 };
    const excelRow = excelDict[key] || { BetAmount: 0, Payout: 0 };

    if (dbRow.BetAmount !== excelRow.BetAmount || dbRow.Payout !== excelRow.Payout) {
      differences.push({
        RoundId: key,
        BetAmount_DB: dbRow.BetAmount,
        Payout_DB: dbRow.Payout,
        BetAmount_Excel: excelRow.BetAmount,
        Payout_Excel: excelRow.Payout
      });
    }
  });

  return differences;
}

// Save differences to a new Excel file
async function writeToExcel(differences) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Differences');

  worksheet.columns = [
    { header: 'RoundId', key: 'RoundId' },
    { header: 'BetAmount_DB', key: 'BetAmount_DB' },
    { header: 'Payout_DB', key: 'Payout_DB' },
    { header: 'BetAmount_Excel', key: 'BetAmount_Excel' },
    { header: 'Payout_Excel', key: 'Payout_Excel' }
  ];

  differences.forEach(diff => {
    worksheet.addRow(diff);
  });

  const outputFilePath = path.join(__dirname, 'differences.xlsx');
  await workbook.xlsx.writeFile(outputFilePath);

  return outputFilePath;
}

// API Endpoint
router.get('/compare', async (req, res) => {
  const excelFilePath = '/Users/nicklim/Desktop/Book1.xlsx'; // Set your Excel file path

  if (!fs.existsSync(excelFilePath)) {
    return res.status(404).send('Excel file not found');
  }

  try {
    // Load data
    const dbData = await loadDatabaseData();
    const excelData = await loadExcelData(excelFilePath);

    // Find differences
    const differences = findDifferences(dbData, excelData);

    if (differences.length === 0) {
      return res.send('No differences found');
    }

    // Write differences to a new Excel file
    const outputPath = await writeToExcel(differences);

    // Send the Excel file as response
    res.sendFile(outputPath);
  } catch (error) {
    console.error('Error comparing data:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

