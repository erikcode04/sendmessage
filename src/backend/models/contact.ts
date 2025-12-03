export interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
}

export interface CreateContactRequest {
    name: string;
    phoneNumber: string;
}
