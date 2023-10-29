import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
	mongoose.set('strictQuery', true);

	if (!process.env.MONGODB_URL) return console.log('Not found');
	if (isConnected) return console.log('Connected');

	try {
		await mongoose.connect(process.env.MONGODB_URL);
		isConnected = true;
	} catch (error) {
		console.log({ error });
	}
};
