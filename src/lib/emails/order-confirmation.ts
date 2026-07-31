export const sendOrderConfirmationEmail = async (email: string, orderId: string, total: number) => {
  // In a real app, this would use Resend or SendGrid API
  console.log(`Sending order confirmation email to ${email}`);
  console.log(`Order ID: ${orderId}, Total: ฿${total.toLocaleString()}`);

  // Simulating email send delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
};