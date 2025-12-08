import { Collection, ObjectId } from 'mongodb';
import mongoDb from '../database.ts';
import type { User } from '../models/user.ts';
import type { Contact, CreateContactRequest, SendMessageRequest, Message } from '../models/contact.ts';
import { randomUUID } from 'crypto';

export class ContactService {
    private collection: Collection<User> | null = null;

    private async getCollection(): Promise<Collection<User>> {
        if (!this.collection) {
            this.collection = await mongoDb.getCollection<User>('users');
        }
        return this.collection;
    }

    async getContacts(userId: string): Promise<Contact[]> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        return user?.contacts || [];
    }

    async createContact(userId: string, data: CreateContactRequest): Promise<Contact> {
        const collection = await this.getCollection();
        const newContact: Contact = {
            id: randomUUID(),
            name: data.name,
            phoneNumber: data.phoneNumber,
            messages: []
        };

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { contacts: newContact } }
        );

        return newContact;
    }

    async deleteContact(userId: string, contactId: string): Promise<boolean> {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { contacts: { id: contactId } } }
        );
        return result.modifiedCount === 1;
    }

    async sendMessage(userId: string, contactId: string, data: SendMessageRequest): Promise<Message> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        const contact = user?.contacts?.find(c => c.id === contactId);

        if (!contact) {
            throw new Error('Contact not found');
        }

        const newMessage: Message = {
            id: randomUUID(),
            text: data.text,
            sentAt: new Date(),
            sentBy: 'user'
        };

        await collection.updateOne(
            { _id: new ObjectId(userId), 'contacts.id': contactId },
            { $push: { 'contacts.$.messages': newMessage } }
        );

        // Send SMS via 46elks
        await this.sendSMS(contact.phoneNumber, data.text);

        return newMessage;
    }

    private async sendSMS(to: string, message: string): Promise<void> {
        try {
            const username = process.env.ELKS_USERNAME;
            const password = process.env.ELKS_PASSWORD;
            const from = process.env.ELKS_FROM || 'ElksWelcome';

            if (!username || !password) {
                console.error('46elks credentials not configured');
                return;
            }

            // Ensure phone number starts with + and country code
            let phoneNumber = to.trim();
            if (!phoneNumber.startsWith('+')) {
                // If it starts with 0, replace with +46 (Sweden)
                if (phoneNumber.startsWith('0')) {
                    phoneNumber = '+46' + phoneNumber.substring(1);
                } else {
                    phoneNumber = '+' + phoneNumber;
                }
            }

            const auth = Buffer.from(`${username}:${password}`).toString('base64');

            const formData = new URLSearchParams({
                from: from,
                to: phoneNumber,
                message: message
            });

            const response = await fetch('https://api.46elks.com/a1/sms', {
                method: 'POST',
                body: formData.toString(),
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const responseText = await response.text();

            if (response.ok) {
                try {
                    const result = JSON.parse(responseText);
                    console.log('46elks SMS sent successfully:', result);
                } catch {
                    console.log('46elks SMS sent:', responseText);
                }
            } else {
                console.error('46elks API error:', response.status, responseText);
            }
        } catch (error) {
            console.error('Failed to send SMS via 46elks:', error);
        }
    }

    async getMessages(userId: string, contactId: string): Promise<Message[]> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        const contact = user?.contacts?.find(c => c.id === contactId);
        return contact?.messages || [];
    }
}
