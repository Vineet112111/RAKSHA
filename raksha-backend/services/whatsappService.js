/**
 * Mock WhatsApp Utility Service
 * Simulates sending real WhatsApp notifications by formatting and printing
 * alerts in the Node.js backend console.
 */
export const sendWhatsAppMessage = (name, phone, message) => {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║ 📱 [MOCK WHATSAPP DISPATCHED]                                      ║
║ Time: ${timestamp.padEnd(59)} ║
║ To: ${(name + " (" + phone + ")").padEnd(61)} ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
${message.split('\n').map(line => `║ ${line.padEnd(66)} ║`).join('\n')}
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);
  return true;
};
