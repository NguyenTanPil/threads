'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/user.models';
import { connectToDB } from '../mongoose';
import { isEqual } from 'lodash';
import Thread from '../models/thread.models';
import { FilterQuery, SortOrder } from 'mongoose';

interface Params {
	userId: string;
	username: string;
	name: string;
	bio: string;
	path: string;
	image: string;
}

export const updateUser = async ({ userId, username, name, bio, path, image }: Params): Promise<void> => {
	connectToDB();

	try {
		await User.findOneAndUpdate(
			{
				id: userId,
			},
			{
				username: username.toLowerCase(),
				name,
				bio,
				image,
				onboarded: true,
			},
			{
				upsert: true,
			},
		);

		if (isEqual(path, '/profile/edit')) {
			revalidatePath(path);
		}
	} catch (error: any) {
		throw new Error(`Fails to create user: ${error.message}`);
	}
};

export const fetchUser = async (userId: string) => {
	try {
		connectToDB();

		return await User.findOne({ id: userId });
		// .populate({
		// 	path: 'community',
		// 	model: Community,
		// });
	} catch (error: any) {
		throw new Error(`Fails to create user: ${error.message}`);
	}
};

export const fetchUserPosts = async (userId: string) => {
	try {
		connectToDB();

		// Find all threads authored by the user with the given userId
		const threads = await User.findOne({ id: userId }).populate({
			path: 'threads',
			model: Thread,
			populate: [
				// {
				// 	path: 'community',
				// 	model: Community,
				// 	select: 'name id image _id', // Select the "name" and "_id" fields from the "Community" model
				// },
				{
					path: 'children',
					model: Thread,
					populate: {
						path: 'author',
						model: User,
						select: 'name image id', // Select the "name" and "_id" fields from the "User" model
					},
				},
			],
		});
		return threads;
	} catch (error) {
		console.error('Error fetching user threads:', error);
		throw error;
	}
};

export const fetchUsers = async ({
	userId,
	searchString = '',
	pageNumber = 1,
	pageSize = 20,
	sortBy = 'desc',
}: {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	sortBy?: SortOrder;
}) => {
	try {
		connectToDB();
		const skipAmount = (pageNumber - 1) * pageSize;
		const regex = new RegExp(searchString, 'i');
		const query: FilterQuery<typeof User> = {
			id: { $ne: userId },
		};

		if (searchString.trim() !== '') {
			query.$or = [
				{
					username: { $regex: regex },
				},
				{
					name: { $regex: regex },
				},
			];
		}

		const sortOptions = { createdAt: sortBy };

		const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);
		const totalUserCount = await User.countDocuments(query);
		const users = await usersQuery.exec();
		const isNext = totalUserCount > skipAmount + users.length;
		return { users, isNext };
	} catch (error: any) {
		console.error('Error fetching user threads:', error);
	}
};

export const getActivity = async (userId: string) => {
	try {
		connectToDB();

		const userThreads = await Thread.find({ author: userId });

		const childThreadIds = userThreads.reduce((acc, userThread) => {
			return acc.concat(userThread.children);
		}, []);

		const replies = await Thread.find({
			_id: { $in: childThreadIds },
			author: { $ne: userId },
		}).populate({
			path: 'author',
			model: User,
			select: 'name image _id',
		});

		return replies;
	} catch (error: any) {
		throw new Error(`Failed to fetch activity: ${error.message}`);
	}
};
