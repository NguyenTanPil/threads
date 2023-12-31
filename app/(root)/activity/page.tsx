import UserCard from '@/components/cards/UserCard';
import { fetchUser, fetchUsers, getActivity } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { isEmpty } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Page = async () => {
	const user = await currentUser();
	if (!user) return null;

	const userInfo = await fetchUser(user.id);

	if (!userInfo.onboarded) {
		redirect('/onboarding');
	}

	const activities = await getActivity(userInfo._id);

	return (
		<section className=''>
			<h1 className='head-text mb-10'>Activity</h1>

			<section className='mt-10 flex flex-col gap-5'>
				{isEmpty(activities) ? (
					<p className='!text-base-regular text-light-3'>No activity yet</p>
				) : (
					<>
						{activities.map((activity) => (
							<Link
								key={activity._id}
								href={`/thread/${activity.parentId}`}
							>
								<article className='activity-card'>
									<Image
										src={activity.author.image}
										alt='Profile user'
										width={20}
										height={20}
										className='rounded-full object-cover'
									/>
									<p className='!text-small-regular text-light-1'>
										<span className='mr-1 text-purple-500'>{activity.author.name}</span> replied to your thread
									</p>
								</article>
							</Link>
						))}
					</>
				)}
			</section>
		</section>
	);
};

export default Page;
