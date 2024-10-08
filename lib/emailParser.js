import { simpleParser } from 'mailparser';
import pdf from 'pdf-parse';
import { Document } from 'docx';

export async function extractResumeText(emailContent, gmail) {
  try {
    let resumeUrl = '';

    if (emailContent && typeof emailContent === 'object') {
      // Check for attachments
      if (emailContent.payload.parts) {
        for (const part of emailContent.payload.parts) {
          if (part.filename && part.body.attachmentId) {
            // Construct the full URL for the attachment
            resumeUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${emailContent.id}/attachments/${part.body.attachmentId}`;
            break; // Assuming we only need the first attachment
          }
        }
      }
    }

    return resumeUrl;
  } catch (error) {
    console.error('Error parsing email content:', error);
    return '';
  }
}

export async function extractResumeAttachment(emailContent, gmail) {
  try {
    if (emailContent && typeof emailContent === 'object' && emailContent.payload.parts) {
      for (const part of emailContent.payload.parts) {
        if (part.filename && part.body.attachmentId) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: emailContent.id,
            id: part.body.attachmentId
          });

          return {
            filename: part.filename,
            mimeType: part.mimeType,
            data: attachment.data.data // This is base64url encoded data
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting resume attachment:', error);
    return null;
  }
}

async function getAttachmentData(gmail, messageId, attachmentId) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    if (response.data.data) {
      return Buffer.from(response.data.data, 'base64');
    }
  } catch (error) {
    console.error('Error fetching attachment:', error);
  }
  return null;
}

async function parseAttachment(filename, data) {
  const fileExtension = filename.split('.').pop().toLowerCase();

  switch (fileExtension) {
    case 'pdf':
      return await parsePDF(data);
    case 'docx':
      return await parseDocx(data);
    default:
      return data.toString('utf-8');
  }
}

async function parsePDF(data) {
  try {
    const pdfData = await pdf(data);
    return pdfData.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

async function parseDocx(data) {
  try {
    const doc = new Document(data);
    const text = await doc.getText();
    return text;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return '';
  }
}
