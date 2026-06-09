const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function extractTextFromFile(filePath, mimetype, originalName) {
  const ext = originalName.toLowerCase().split('.').pop();

  // Try PDF extraction
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return await extractFromPDF(filePath);
  }

  // Try DOCX extraction
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    return await extractFromDOCX(filePath);
  }

  // Try plain text
  if (mimetype === 'text/plain' || ext === 'txt') {
    const text = fs.readFileSync(filePath, 'utf-8');
    if (text.trim().length < 50) throw new Error('File appears to be empty or too short.');
    return text.trim();
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload a PDF, DOCX, or TXT file.`);
}

async function extractFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  // Try multiple options for better extraction
  const options = [
    {},
    { max: 0 },
    { version: 'v1.10.100' }
  ];

  let lastError;
  for (const opt of options) {
    try {
      const data = await pdfParse(dataBuffer, opt);
      const text = data.text ? data.text.trim() : '';

      if (text.length > 50) {
        return cleanText(text);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error('Could not extract text from PDF. The file may be scanned/image-based or password protected. Please try a text-based PDF or DOCX file.');
}

async function extractFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value ? result.value.trim() : '';

    if (text.length < 50) {
      throw new Error('DOCX file appears to be empty or contains mostly images.');
    }

    return cleanText(text);
  } catch (err) {
    if (err.message.includes('empty')) throw err;
    throw new Error('Could not extract text from DOCX file. Please ensure the file is not corrupted.');
  }
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .trim();
}

module.exports = { extractTextFromFile };
