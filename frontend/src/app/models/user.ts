export class User {
	_id: string;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	address: string;
	phone: string;
	email: string;
	avatarImagePath: string;
	role: string;
	registeredSuccessfully: boolean = false;
	blocked: boolean = false;
}
