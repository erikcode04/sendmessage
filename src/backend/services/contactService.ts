import { Collection, ObjectId } from 'mongodb';
import mongoDb from '../database.ts';
import type { User } from '../models/user.ts';
import type { Contact, CreateContactRequest } from '../models/contact.ts';
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
            phoneNumber: data.phoneNumber
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
}
