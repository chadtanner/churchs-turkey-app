import { NextResponse } from 'next/server';
import { Resend } from 'resend';


export async function POST(request: Request) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { reservation, restaurant } = await request.json();

        // Validate required fields
        if (!reservation || !restaurant) {
            return NextResponse.json({ error: 'Missing reservation or restaurant data' }, { status: 400 });
        }

        const { customerName, customerEmail, confirmationId, quantity, totalAmount, pickupTime } = reservation;
        const { restaurantName, address, pickupDate } = restaurant;

        // Construct Email HTML
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #9A3324; margin-bottom: 8px;">Reservation Confirmed!</h1>
                    <p style="color: #4b5563; font-size: 16px; margin: 0;">Thank you for reserving with Church's Texas Chicken.</p>
                </div>

                <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="margin-bottom: 16px;">
                        <strong style="color: #374151; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Confirmation ID</strong>
                        <span style="color: #111827; font-size: 24px; font-weight: bold; letter-spacing: 0.05em;">${confirmationId}</span>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h3 style="color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Reservation Details</h3>
                    
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Order:</strong>
                        <span style="color: #111827;">${quantity}x Whole Smoked Turkey</span>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Total Due at Pickup:</strong>
                        <span style="color: #111827;">$${totalAmount.toFixed(2)} (plus tax)</span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Pickup Location:</strong><br/>
                        <span style="color: #111827;">${restaurantName}</span><br/>
                        <span style="color: #6b7280;">${address.street}, ${address.city}, ${address.state} ${address.zipCode}</span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Pickup Date & Time:</strong><br/>
                        <span style="color: #111827;">${new Date(pickupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} @ ${pickupTime}</span>
                    </div>
                </div>

                <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <strong style="color: #92400E; display: block; margin-bottom: 4px;">Important Instructions:</strong>
                    <p style="color: #B45309; margin: 0; font-size: 14px;">
                        Please bring this confirmation email and a valid ID to the restaurant. Payment is due upon pickup. 
                        Your turkey is frozen and will need to be thawed and heated before serving.
                    </p>
                </div>
                
                <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px;">
                    &copy; ${new Date().getFullYear()} Church's Texas Chicken. All rights reserved.
                </div>
            </div>
        `;

        const data = await resend.emails.send({
            from: 'Church\'s Turkey Reservations <onboarding@resend.dev>', // Use verified domain closer to prod
            to: [customerEmail],
            subject: `Reservation Confirmed: ${confirmationId}`,
            html: emailHtml,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
