export interface Message {
    id: string;
    text: string;
    sentAt: Date;
    sentBy: 'user' | 'contact';
}

export interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    messages: Message[];
}

export interface CreateContactRequest {
    name: string;
    phoneNumber: string;
}

export interface SendMessageRequest {
    text: string;
}
