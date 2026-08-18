const STATUS_MAP = {
  new: { en: 'New', gu: 'નવું', hi: 'नया' },
  pending: { en: 'Pending', gu: 'પેન્ડિંગ', hi: 'लंबित' },
  triaged: { en: 'Triaged', gu: 'ટ્રાયજ્ડ', hi: 'ट्रियाज्ड' },
  assigned: { en: 'Assigned', gu: 'સોંપાયેલ', hi: 'आवंटित' },
  investigating: { en: 'Under Investigation', gu: 'તપાસ હેઠળ', hi: 'जांच के तहत' },
  under_investigation: { en: 'Under Investigation', gu: 'તપાસ હેઠળ', hi: 'जांच के तहत' },
  evidence_review: { en: 'Evidence Review', gu: 'પુરાવા સમીક્ષા', hi: 'साक्ष्य समीक्षा' },
  supervisor_review: { en: 'Supervisor Review', gu: 'સુપરવાઈઝર સમીક્ષા', hi: 'पर्यवेक्षक समीक्षा' },
  resolved: { en: 'Resolved', gu: 'ઉકેલાયેલ', hi: 'हल किया गया' },
  closed: { en: 'Closed', gu: 'બંધ થયેલ', hi: 'बंद' },
};

export const translateStatus = (statusKey, lang = 'en') => {
  if (!statusKey) return '';
  const langCode = (lang || 'en').slice(0, 2).toLowerCase();
  const key = String(statusKey).toLowerCase().trim().replace(/ /g, '_');
  const entry = STATUS_MAP[key];
  if (entry) {
    return entry[langCode] || entry['en'] || statusKey;
  }
  return statusKey.replace(/_/g, ' ').toUpperCase();
};

export const translateEventTitle = (title, lang = 'en') => {
  if (!title) return '';
  const langCode = (lang || 'en').slice(0, 2).toLowerCase();
  
  if (title.startsWith('Status Updated:')) {
    const rawStatus = title.replace('Status Updated:', '').trim();
    const translatedSt = translateStatus(rawStatus, langCode);
    if (langCode === 'gu') return `સ્થિતિ અપડેટ કરી: ${translatedSt}`;
    if (langCode === 'hi') return `स्थिति अद्यतन: ${translatedSt}`;
    return `Status Updated: ${translatedSt}`;
  }
  if (title === 'Complaint Filed') {
    if (langCode === 'gu') return 'ફરિયાદ સફળતાપૂર્વક નોંધાઈ';
    if (langCode === 'hi') return 'शिकायत दर्ज की गई';
    return 'Complaint Filed';
  }
  return title;
};

export const translateEventDesc = (desc, lang = 'en') => {
  if (!desc) return '';
  const langCode = (lang || 'en').slice(0, 2).toLowerCase();
  
  if (desc.includes('The complaint status was changed to')) {
    const rawStatus = desc.replace('The complaint status was changed to', '').replace('.', '').trim();
    const translatedSt = translateStatus(rawStatus, langCode);
    if (langCode === 'gu') return `ફરિયાદની સ્થિતિ બદલીને ${translatedSt} કરવામાં આવી હતી.`;
    if (langCode === 'hi') return `शिकायत की स्थिति बदलकर ${translatedSt} कर दी गई।`;
    return `The complaint status was changed to ${translatedSt}.`;
  }
  if (desc === 'Complaint submitted and AI analysis initiated.') {
    if (langCode === 'gu') return 'ફરિયાદ સબમિટ કરી અને AI વિશ્લેષણ શરૂ કર્યું.';
    if (langCode === 'hi') return 'शिकायत जमा की गई और एआई विश्लेषण शुरू हुआ।';
    return 'Complaint submitted and AI analysis initiated.';
  }
  return desc;
};

export const translateNotificationMessage = (msg, lang = 'en') => {
  if (!msg) return '';
  const langCode = (lang || 'en').slice(0, 2).toLowerCase();

  if (msg.includes('is now')) {
    const parts = msg.split('is now');
    const complaintRef = parts[0]?.trim();
    const rawStatus = parts[1]?.replace('.', '').trim();
    const translatedSt = translateStatus(rawStatus, langCode);
    if (langCode === 'gu') return `${complaintRef} હવે ${translatedSt} સ્થિતિમાં છે.`;
    if (langCode === 'hi') return `${complaintRef} अब ${translatedSt} स्थिति में है।`;
    return `${complaintRef} is now ${translatedSt}.`;
  }
  return msg;
};
