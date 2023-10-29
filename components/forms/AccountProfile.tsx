'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserValidation } from '@/lib/validations/user';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { Textarea } from '../ui/textarea';
import { useUploadThing } from '@/lib/uploadthing';
import { isBase64Image } from '@/lib/utils';
import { updateUser } from '@/lib/actions/user.actions';
import { usePathname, useRouter } from 'next/navigation';
import { isEqual } from 'lodash';

interface Props {
	user: {
		id: string;
		objectId: string;
		username: string;
		name: string;
		bio: string;
		image: string;
	};
	btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
	const [files, setFiles] = useState<File[]>([]);
	const { startUpload } = useUploadThing('media');
	const pathname = usePathname();
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(UserValidation),
		defaultValues: {
			bio: user?.bio || '',
			name: user?.name || '',
			username: user?.name || '',
			profile_photo: user?.image || '',
		},
	});

	const onSubmit = async (values: z.infer<typeof UserValidation>) => {
		const blob = values.profile_photo;

		const hasImageChange = isBase64Image(blob);

		if (hasImageChange) {
			const imageRes = await startUpload(files);

			if (imageRes && imageRes[0].fileUrl) {
				values.profile_photo = imageRes[0].fileUrl;
			}
		}

		await updateUser({
			userId: user.id,
			username: values.username,
			name: values.name,
			bio: values.bio,
			path: pathname,
			image: values.profile_photo,
		});

		if (isEqual(pathname, '/profile/edit')) {
			router.back();
		} else {
			router.push('/');
		}
	};

	const handleUpdateImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
		e.preventDefault();
		const fileReader = new FileReader();
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
			setFiles(Array.from(files));

			if (!file.type.includes('image')) {
				return;
			}

			fileReader.onload = async (event) => {
				const imageDataUrl = event.target?.result?.toString() || '';
				fieldChange(imageDataUrl);
			};

			fileReader.readAsDataURL(file);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col justify-start gap-10'
			>
				<FormField
					control={form.control}
					name='profile_photo'
					render={({ field }) => (
						<FormItem className='flex items-center gap-4'>
							<FormLabel className='account-form_image-label'>
								{field.value ? (
									<Image
										src={field.value}
										alt='profile photo'
										width={96}
										height={96}
										priority
										className='rounded-full object-container'
									/>
								) : (
									<Image
										src='/assets/profile.svg'
										alt='profile photo'
										width={24}
										height={24}
										priority
										className='object-container'
									/>
								)}
							</FormLabel>
							<FormControl className='flex-1 text-base-semibold text-gray-200'>
								<Input
									type='file'
									accept='image/*'
									placeholder='Upload the photo'
									className='account-form_image-input'
									onChange={(e) => handleUpdateImage(e, field.onChange)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem className='flex flex-col gap-3 w-full'>
							<FormLabel className='text-base-semibold text-gray-200'>Name</FormLabel>
							<FormControl className='flex-1 text-base-semibold text-gray-200'>
								<Input
									type='text'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='username'
					render={({ field }) => (
						<FormItem className='flex flex-col gap-3 w-full'>
							<FormLabel className='text-base-semibold text-gray-200'>Username</FormLabel>
							<FormControl className='flex-1 text-base-semibold text-gray-200'>
								<Input
									type='text'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='bio'
					render={({ field }) => (
						<FormItem className='flex flex-col gap-3 w-full'>
							<FormLabel className='text-base-semibold text-gray-200'>Bio</FormLabel>
							<FormControl className='flex-1 text-base-semibold text-gray-200'>
								<Textarea
									rows={10}
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type='submit'
					className='bg-primary-500'
				>
					Submit
				</Button>
			</form>
		</Form>
	);
};

export default AccountProfile;
