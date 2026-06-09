const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer, {
      // Disable test mode
      max: 0,
    });
    const text = data.text || '';
    if (!text.trim()) {
      throw new Error('PDF appears to be empty or image-based (scanned). Please use a text-based PDF.');
    }
    return text.trim();
  } catch (err) {
    if (err.message.includes('empty') || err.message.includes('scanned')) throw err;
    throw new Error(`PDF extraction failed: ${err.message}`);
  }
}

async function extractFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    if (!text.trim()) {
      throw new Error('DOCX file appears to be empty.');
    }
    return text.trim();
  } catch (err) {
    throw new Error(`DOCX extraction failed: ${err.message}`);
  }
}

async function extractText(buffer, mimetype, originalname) {
  const ext = originalname.split('.').pop().toLowerCase();

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    return await extractFromPDF(buffer);
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === 'docx' || ext === 'doc'
  ) {
    return await extractFromDOCX(buffer);
  }

  if (mimetype === 'text/plain' || ext === 'txt') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload PDF, DOCX, or TXT.`);
}

module.exports = { extractText };
